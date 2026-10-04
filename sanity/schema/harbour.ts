import { defineField, defineType } from "sanity";

export const harbour = defineType({
  name: "harbour",
  title: "Harbour",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "lat", title: "Latitude", type: "number", validation: (r) => r.required() }),
    defineField({ name: "lon", title: "Longitude", type: "number", validation: (r) => r.required() }),
    defineField({
      name: "seaArea",
      type: "string",
      description: "Short local name for the water the skipper is entering.",
    }),
  ],
});
