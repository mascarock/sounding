import { defineField, defineType } from "sanity";

export const claim = defineType({
  name: "claim",
  title: "Claim",
  type: "document",
  fields: [
    defineField({ name: "statement", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({
      name: "about",
      type: "reference",
      to: [{ type: "berth" }, { type: "harbour" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "source",
      type: "reference",
      to: [{ type: "sourceDocument" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "validFrom", type: "date", validation: (r) => r.required() }),
    defineField({
      name: "topic",
      type: "string",
      options: {
        list: [
          { title: "Depth", value: "depth" },
          { title: "Access", value: "access" },
          { title: "Reservation", value: "reservation" },
          { title: "Shelter", value: "shelter" },
          { title: "Season", value: "season" },
        ],
      },
    }),
  ],
});
