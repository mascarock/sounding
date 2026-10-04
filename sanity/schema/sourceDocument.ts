import { defineField, defineType } from "sanity";

export const sourceDocument = defineType({
  name: "sourceDocument",
  title: "Source document",
  type: "document",
  fields: [
    defineField({
      name: "kind",
      type: "string",
      options: {
        list: [
          { title: "Almanac excerpt", value: "almanacExcerpt" },
          { title: "Harbour notice", value: "harbourNotice" },
          { title: "Silt survey", value: "siltSurvey" },
          { title: "Weather rule", value: "weatherRule" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "code", type: "string" }),
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "issuedOn", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "harbour",
      type: "reference",
      to: [{ type: "harbour" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "supersedes",
      type: "reference",
      to: [{ type: "sourceDocument" }],
      description: "The document whose standing figures this one replaces. Later date alone is not enough.",
    }),
    defineField({
      name: "cites",
      type: "array",
      of: [{ type: "reference", to: [{ type: "sourceDocument" }] }],
    }),
    defineField({
      name: "appliesTo",
      type: "array",
      of: [{ type: "reference", to: [{ type: "berth" }] }],
    }),
    defineField({
      name: "subjectBerth",
      type: "reference",
      to: [{ type: "berth" }],
    }),
    defineField({
      name: "body",
      type: "text",
      rows: 6,
      validation: (r) => r.required().max(900),
    }),
    defineField({
      name: "standingDepthMetres",
      type: "number",
      description: "Standing depth this document asserts, if it asserts one.",
    }),
    defineField({ name: "maxDraftMetres", type: "number" }),
    defineField({
      name: "reservedWeekday",
      type: "string",
      options: {
        list: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
      },
    }),
    defineField({ name: "reservedAfter", type: "string", description: "HH:MM, 24h" }),
    defineField({
      name: "closedFrom",
      type: "string",
      description: "MM-DD inclusive, seasonal close.",
    }),
    defineField({ name: "closedUntil", type: "string", description: "MM-DD inclusive." }),
    defineField({
      name: "windDirection",
      type: "string",
      description: "weatherRule only. e.g. gregale, scirocco, NE.",
      hidden: ({ parent }) => parent?.kind !== "weatherRule",
    }),
    defineField({
      name: "minKnots",
      type: "number",
      hidden: ({ parent }) => parent?.kind !== "weatherRule",
    }),
    defineField({
      name: "effect",
      type: "text",
      rows: 3,
      hidden: ({ parent }) => parent?.kind !== "weatherRule",
    }),
    defineField({
      name: "effectBerths",
      type: "array",
      of: [{ type: "reference", to: [{ type: "berth" }] }],
      hidden: ({ parent }) => parent?.kind !== "weatherRule",
    }),
  ],
});
