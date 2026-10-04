import type { SeedDocument } from "../../../sanity/types";

type Token =
  | { t: "ident"; v: string }
  | { t: "string"; v: string }
  | { t: "number"; v: number }
  | { t: "param"; v: string }
  | { t: "op"; v: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const peek = () => input[i];
  while (i < input.length) {
    const c = peek();
    if (c === undefined) break;
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    if (input.startsWith("...", i)) {
      tokens.push({ t: "op", v: "..." });
      i += 3;
      continue;
    }
    if (input.startsWith("->", i)) {
      tokens.push({ t: "op", v: "->" });
      i += 2;
      continue;
    }
    if (input.startsWith("==", i) || input.startsWith("!=", i) || input.startsWith("<=", i) || input.startsWith(">=", i)) {
      tokens.push({ t: "op", v: input.slice(i, i + 2) });
      i += 2;
      continue;
    }
    if ("[]{}(),.:|&<>!*".includes(c)) {
      tokens.push({ t: "op", v: c });
      i += 1;
      continue;
    }
    if (c === '"' || c === "'") {
      const q = c;
      i += 1;
      let s = "";
      while (i < input.length && input[i] !== q) {
        s += input[i];
        i += 1;
      }
      i += 1;
      tokens.push({ t: "string", v: s });
      continue;
    }
    if (c === "$") {
      i += 1;
      let s = "";
      while (i < input.length && /[A-Za-z0-9_]/.test(input[i] ?? "")) {
        s += input[i];
        i += 1;
      }
      tokens.push({ t: "param", v: s });
      continue;
    }
    if (/[0-9-]/.test(c) && (c !== "-" || /[0-9]/.test(input[i + 1] ?? ""))) {
      let s = "";
      if (c === "-") {
        s = "-";
        i += 1;
      }
      while (i < input.length && /[0-9.]/.test(input[i] ?? "")) {
        s += input[i];
        i += 1;
      }
      tokens.push({ t: "number", v: Number(s) });
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let s = "";
      while (i < input.length && /[A-Za-z0-9_]/.test(input[i] ?? "")) {
        s += input[i];
        i += 1;
      }
      tokens.push({ t: "ident", v: s });
      continue;
    }
    throw new Error(`Unexpected character in GROQ: ${c}`);
  }
  return tokens;
}

class Parser {
  constructor(
    private tokens: Token[],
    private i = 0,
  ) {}

  peek() {
    return this.tokens[this.i];
  }

  eat() {
    const t = this.tokens[this.i];
    this.i += 1;
    return t;
  }

  matchOp(v: string) {
    const t = this.peek();
    if (t?.t === "op" && t.v === v) {
      this.eat();
      return true;
    }
    return false;
  }

  expectOp(v: string) {
    if (!this.matchOp(v)) throw new Error(`Expected ${v}`);
  }
}

function getPath(doc: unknown, path: string): unknown {
  if (!path) return doc;
  const parts = path.split(".");
  let cur: unknown = doc;
  for (const part of parts) {
    if (cur == null) return undefined;
    const arrayField = part.match(/^([A-Za-z0-9_]+)\[\]$/);
    if (arrayField) {
      const key = arrayField[1];
      const arr = (cur as Record<string, unknown>)[key];
      if (!Array.isArray(arr)) return [];
      cur = arr;
      continue;
    }
    if (Array.isArray(cur)) {
      cur = cur.map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>)[part] : undefined));
      continue;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function asArray(value: unknown): unknown[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function evalAtom(
  tok: Token | undefined,
  doc: SeedDocument,
  params: Record<string, unknown>,
): unknown {
  if (!tok) return undefined;
  if (tok.t === "string" || tok.t === "number") return tok.v;
  if (tok.t === "param") return params[tok.v];
  if (tok.t === "ident") {
    if (tok.v === "true") return true;
    if (tok.v === "false") return false;
    if (tok.v === "null") return null;
    return undefined;
  }
  return undefined;
}

function parsePath(p: Parser): string {
  const first = p.peek();
  if (first?.t !== "ident") throw new Error("Expected field path");
  let path = (p.eat() as { v: string }).v;
  while (true) {
    if (p.matchOp("[")) {
      if (p.matchOp("]")) {
        path += "[]";
        continue;
      }
      throw new Error("Only [] membership paths are supported in filters");
    }
    if (p.matchOp(".")) {
      const next = p.peek();
      if (next?.t !== "ident") throw new Error("Expected field after .");
      path += `.${(p.eat() as { v: string }).v}`;
      continue;
    }
    break;
  }
  return path;
}

function evalFilter(expr: string, doc: SeedDocument, params: Record<string, unknown>): boolean {
  const p = new Parser(tokenize(expr));

  function parseOr(): boolean {
    let left = parseAnd();
    while (true) {
      const t = p.peek();
      if (t?.t === "ident" && t.v === "||") {
        p.eat();
        const right = parseAnd();
        left = left || right;
        continue;
      }
      if (t?.t === "op" && t.v === "|") {
        p.eat();
        if (p.matchOp("|")) {
          const right = parseAnd();
          left = left || right;
          continue;
        }
        throw new Error("Unexpected |");
      }
      break;
    }
    return left;
  }

  function parseAnd(): boolean {
    let left = parseCompare();
    while (true) {
      const t = p.peek();
      if (t?.t === "ident" && t.v === "&&") {
        p.eat();
        const right = parseCompare();
        left = left && right;
        continue;
      }
      if (t?.t === "op" && t.v === "&") {
        p.eat();
        if (p.matchOp("&")) {
          const right = parseCompare();
          left = left && right;
          continue;
        }
        throw new Error("Unexpected &");
      }
      break;
    }
    return left;
  }

  function parseCompare(): boolean {
    const t = p.peek();
    if (t?.t === "op" && t.v === "(") {
      p.eat();
      const inner = parseOr();
      p.expectOp(")");
      return inner;
    }
    if (t?.t === "ident" && t.v === "defined") {
      p.eat();
      p.expectOp("(");
      const path = parsePath(p);
      p.expectOp(")");
      const v = getPath(doc, path);
      return v !== undefined && v !== null;
    }

    const leftTok = p.peek();
    let left: unknown;
    let leftIsPath = false;
    let leftPath = "";
    if (leftTok?.t === "param") {
      left = params[leftTok.v];
      p.eat();
    } else if (leftTok?.t === "string" || leftTok?.t === "number") {
      left = leftTok.v;
      p.eat();
    } else if (leftTok?.t === "ident") {
      leftPath = parsePath(p);
      left = getPath(doc, leftPath);
      leftIsPath = true;
    } else {
      throw new Error("Invalid filter atom");
    }

    const opTok = p.peek();
    if (opTok?.t === "ident" && (opTok.v === "in" || opTok.v === "match")) {
      const op = opTok.v;
      p.eat();
      return applyOp(op, left, parseRight(), leftPath, leftIsPath);
    }
    if (opTok?.t === "op" && ["==", "!=", ">", "<", ">=", "<="].includes(opTok.v)) {
      const op = opTok.v;
      p.eat();
      return applyOp(op, left, parseRight(), leftPath, leftIsPath);
    }
    return Boolean(left);
  }

  function parseRight(): unknown {
    const t = p.peek();
    if (t?.t === "op" && t.v === "[") {
      p.eat();
      const items: unknown[] = [];
      while (true) {
        if (p.matchOp("]")) break;
        const n = p.peek();
        if (!n) throw new Error("Unclosed array");
        if (n.t === "string" || n.t === "number") {
          items.push(n.v);
          p.eat();
        } else if (n.t === "param") {
          items.push(params[n.v]);
          p.eat();
        } else if (n.t === "ident") {
          items.push(getPath(doc, parsePath(p)));
        } else {
          throw new Error("Invalid array value");
        }
        p.matchOp(",");
      }
      return items;
    }
    if (t?.t === "param") {
      p.eat();
      return params[t.v];
    }
    if (t?.t === "string" || t?.t === "number") {
      p.eat();
      return t.v;
    }
    if (t?.t === "ident") {
      if (t.v === "true" || t.v === "false" || t.v === "null") {
        p.eat();
        return evalAtom(t, doc, params);
      }
      return getPath(doc, parsePath(p));
    }
    throw new Error("Invalid right-hand value");
  }

  function applyOp(op: string, left: unknown, right: unknown, _leftPath: string, _leftIsPath: boolean): boolean {
    if (op === "match") {
      const needle = String(right ?? "").toLowerCase();
      return String(left ?? "")
        .toLowerCase()
        .includes(needle);
    }
    if (op === "in") {
      const hay = asArray(right);
      if (Array.isArray(left) && !Array.isArray(right)) {
        return asArray(left).includes(right);
      }
      return hay.some((item) => item === left || (Array.isArray(item) && item.includes(left)));
    }
    if (op === "==") return left === right;
    if (op === "!=") return left !== right;
    if (typeof left === "number" && typeof right === "number") {
      if (op === ">") return left > right;
      if (op === "<") return left < right;
      if (op === ">=") return left >= right;
      if (op === "<=") return left <= right;
    }
    return false;
  }

  const result = parseOr();
  return result;
}

function projectValue(
  value: unknown,
  corpus: SeedDocument[],
  projection: string | null,
): unknown {
  if (!projection) return value;
  if (Array.isArray(value)) return value.map((v) => projectValue(v, corpus, projection));
  if (!value || typeof value !== "object") return value;
  return projectDoc(value as SeedDocument, corpus, projection);
}

function resolveRef(ref: unknown, corpus: SeedDocument[]): SeedDocument | undefined {
  if (!ref || typeof ref !== "object") return undefined;
  const id = (ref as { _ref?: string })._ref;
  if (!id) return undefined;
  return corpus.find((d) => d._id === id);
}

function projectDoc(doc: SeedDocument, corpus: SeedDocument[], raw: string): Record<string, unknown> {
  const inner = raw.trim().replace(/^{/, "").replace(/}$/, "").trim();
  const fields = splitFields(inner);
  const out: Record<string, unknown> = {};
  let spread = false;
  for (const field of fields) {
    const trimmed = field.trim();
    if (!trimmed) continue;
    if (trimmed === "...") {
      spread = true;
      Object.assign(out, doc);
      continue;
    }
    const alias = trimmed.match(/^["']([^"']+)["']\s*:\s*(.+)$/);
    if (alias) {
      out[alias[1]] = evalProjectionExpr(doc, corpus, alias[2]);
      continue;
    }
    const ident = trimmed.match(/^([A-Za-z0-9_]+)(.*)$/);
    if (ident) {
      out[ident[1]] = evalProjectionExpr(doc, corpus, trimmed);
    }
  }
  if (!spread && !fields.length) return { ...doc };
  return out;
}

function splitFields(inner: string): string[] {
  const parts: string[] = [];
  let buf = "";
  let depth = 0;
  for (const ch of inner) {
    if (ch === "{" || ch === "(" || ch === "[") depth += 1;
    if (ch === "}" || ch === ")" || ch === "]") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(buf);
      buf = "";
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);
  return parts;
}

function evalProjectionExpr(doc: SeedDocument, corpus: SeedDocument[], expr: string): unknown {
  const e = expr.trim();
  const derefProj = e.match(/^([A-Za-z0-9_]+)(\[\])?->(\{.*\})?$/);
  if (derefProj) {
    const key = derefProj[1];
    const isArray = Boolean(derefProj[2]);
    const sub = derefProj[3] ?? null;
    const raw = doc[key];
    if (isArray || Array.isArray(raw)) {
      const items = asArray(raw).map((r) => resolveRef(r, corpus)).filter(Boolean) as SeedDocument[];
      return sub ? items.map((d) => projectDoc(d, corpus, sub)) : items;
    }
    const resolved = resolveRef(raw, corpus);
    if (!resolved) return null;
    return sub ? projectDoc(resolved, corpus, sub) : resolved;
  }
  const aliasAlreadyHandled = e.includes(":");
  if (aliasAlreadyHandled && e.startsWith('"')) return undefined;
  return getPath(doc, e.replace(/->$/, ""));
}

function parseQuery(query: string): {
  filter: string | null;
  projection: string | null;
  order: { field: string; dir: "asc" | "desc" } | null;
  slice: { start: number; end?: number; single?: boolean } | null;
} {
  const q = query.trim();
  if (!q.startsWith("*")) throw new Error("Fixture GROQ only supports * queries");
  let rest = q.slice(1).trim();
  let filter: string | null = null;
  if (rest.startsWith("[")) {
    const end = matching(rest, 0, "[", "]");
    const inside = rest.slice(1, end);
    rest = rest.slice(end + 1).trim();
    if (/^\d/.test(inside) || inside.includes("...")) {
      return { filter: null, projection: null, order: null, slice: parseSlice(inside) };
    }
    filter = inside.trim() || null;
  }
  let projection: string | null = null;
  if (rest.startsWith("{")) {
    const end = matching(rest, 0, "{", "}");
    projection = rest.slice(0, end + 1);
    rest = rest.slice(end + 1).trim();
  }
  let order: { field: string; dir: "asc" | "desc" } | null = null;
  if (rest.startsWith("|")) {
    rest = rest.slice(1).trim();
    const m = rest.match(/^order\(([^)]+)\)/);
    if (m) {
      const bits = m[1].trim().split(/\s+/);
      order = { field: bits[0], dir: bits[1] === "desc" ? "desc" : "asc" };
      rest = rest.slice(m[0].length).trim();
    }
  }
  let slice: { start: number; end?: number; single?: boolean } | null = null;
  if (rest.startsWith("[")) {
    const end = matching(rest, 0, "[", "]");
    slice = parseSlice(rest.slice(1, end));
    rest = rest.slice(end + 1).trim();
  }
  if (!projection && rest.startsWith("{")) {
    const end = matching(rest, 0, "{", "}");
    projection = rest.slice(0, end + 1);
  }
  return { filter, projection, order, slice };
}

function parseSlice(inside: string): { start: number; end?: number; single?: boolean } {
  if (inside.includes("...")) {
    const [a, b] = inside.split("...");
    return { start: Number(a), end: Number(b) };
  }
  return { start: Number(inside), single: true };
}

function matching(s: string, start: number, open: string, close: string): number {
  let depth = 0;
  for (let i = start; i < s.length; i += 1) {
    if (s[i] === open) depth += 1;
    else if (s[i] === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Unbalanced ${open}${close}`);
}

export function runGroq(
  query: string,
  params: Record<string, unknown>,
  corpus: SeedDocument[],
): unknown {
  const parsed = parseQuery(query);
  let rows = [...corpus];
  if (parsed.filter) {
    rows = rows.filter((doc) => evalFilter(parsed.filter as string, doc, params));
  }
  if (parsed.order) {
    const { field, dir } = parsed.order;
    rows.sort((a, b) => {
      const av = getPath(a, field);
      const bv = getPath(b, field);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
  } else {
    rows.sort((a, b) => String(a._id).localeCompare(String(b._id)));
  }
  let projected = parsed.projection ? rows.map((d) => projectDoc(d, corpus, parsed.projection as string)) : rows;
  if (parsed.slice) {
    if (parsed.slice.single) return projected[parsed.slice.start] ?? null;
    projected = projected.slice(parsed.slice.start, parsed.slice.end);
  }
  return projected;
}

export function documentTitle(doc: SeedDocument): string {
  if (typeof doc.title === "string") return doc.title;
  if (typeof doc.name === "string") return doc.name;
  if (typeof doc.statement === "string") return doc.statement.slice(0, 80);
  return doc._id;
}
