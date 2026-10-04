export const JUDGE_CASES = [
  {
    id: "marsamxett-gregale-friday",
    question: "Friday after 18:00, Marsamxett inner pontoon, 1.7 m draft, gregale expected.",
    expectedVerdict: "no-go" as const,
    expectedRecommendation:
      "No safe visitor berth. HN-2024-17 supersedes the 2019 inner-pontoon figure of 2.1 m and records 1.4 m on the inner fingers. HN-2025-03 cites that notice and reserves Outer North and Outer South for the ferry Friday after 18:00. The gregale rule at 20 kn names those same outer berths as the only sheltered visitor berths.",
    mustOpen: [
      "harbour-marsamxett",
      "doc-alm-2019-marsa-pontoon",
      "doc-hn-2024-17",
      "doc-hn-2025-03",
      "doc-wr-marsa-gregale",
    ],
  },
  {
    id: "syracuse-silt",
    question: "Syracuse inner basin east, 2.8 m draft this weekend.",
    expectedVerdict: "no-go" as const,
    expectedRecommendation:
      "Do not enter Inner Basin East. Almanac 3.5 m is superseded by HN-2025-11 after silt survey SS-2025-02 measured 2.2 m. The notice closes the wall to drafts over 2.0 m.",
    mustOpen: [
      "harbour-syracuse",
      "doc-alm-2019-syr-basin",
      "doc-ss-2025-02",
      "doc-hn-2025-11",
    ],
  },
  {
    id: "pozzallo-later-does-not-win",
    question: "Pozzallo commercial quay, 2.9 m draft.",
    expectedVerdict: "no-go" as const,
    expectedRecommendation:
      "Do not berth on the commercial quay. Standing depth is 2.8 m from HN-2024-44, which supersedes the 2019 pocket note. HN-2025-08 is later and claims 3.2 m but does not supersede HN-2024-44, so 3.2 m is not standing.",
    mustOpen: [
      "harbour-pozzallo",
      "doc-alm-2019-poz-commercial",
      "doc-hn-2024-44",
      "doc-hn-2025-08",
    ],
  },
];
