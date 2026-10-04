export type SanityRef = {
  _type: "reference";
  _ref: string;
  _key?: string;
};

export type SeedDocument = Record<string, unknown> & {
  _id: string;
  _type: string;
};
