export const MAX_QUESTION_LENGTH = 280;

export function normalizeQuestion(value: string | null | undefined): string {
  return (value ?? "").trim().slice(0, MAX_QUESTION_LENGTH);
}
