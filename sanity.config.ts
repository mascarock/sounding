import { defineConfig } from "sanity";
import { schemaTypes } from "./sanity/schema";

export default defineConfig({
  name: "sounding",
  title: "Sounding",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "59vrectd",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  schema: { types: schemaTypes },
});
