import { defineField, defineType } from "sanity";

export const berth = defineType({
  name: "berth",
  title: "Berth",
  type: "document",
  fields: [
    defineField({
      name: "harbour",
      type: "reference",
      to: [{ type: "harbour" }],
      validation: (r) => r.required(),
    }),
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "depthAtChartDatum",
      title: "Chart-datum depth (metres)",
      type: "number",
      description:
        "Published chart / almanac figure. Later notices may supersede this; do not treat it as standing.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "shelter",
      type: "string",
      options: {
        list: [
          { title: "Good in north-easterlies", value: "good-ne" },
          { title: "Good in south-easterlies", value: "good-se" },
          { title: "Fair, inner basin", value: "fair-inner" },
          { title: "Poor / exposed", value: "poor" },
          { title: "Dinghy only", value: "dinghy" },
        ],
      },
    }),
    defineField({
      name: "reservedFor",
      type: "string",
      description: "Who the berth is published for on the chart. Notices may tighten this.",
      options: {
        list: [
          { title: "Visitors", value: "visitors" },
          { title: "Ferry", value: "ferry" },
          { title: "Working boats", value: "working-boats" },
          { title: "Fuel barge", value: "fuel-barge" },
          { title: "Navy", value: "navy" },
          { title: "Cruise", value: "cruise" },
          { title: "Commercial", value: "commercial" },
          { title: "Dinghy", value: "dinghy" },
        ],
      },
    }),
  ],
});
