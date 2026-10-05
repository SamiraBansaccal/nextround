import { describe, expect, it } from "vitest";
import { harmonizeCvDates, harmonizePeriod } from "@/lib/profile/cv-dates";
import type { CvDocument } from "@/lib/types";

// One way of writing the dates of a CV, and never a date the CV does not give.

describe("harmonised CV dates", () => {
  it("writes French periods one way: lowercase months, an en dash, « aujourd’hui »", () => {
    expect(harmonizePeriod("janvier 2025 - Juin 2025", "fr")).toBe("janvier 2025 – juin 2025");
    expect(harmonizePeriod("Septembre 2020 - Novembre 2020", "fr")).toBe("septembre 2020 – novembre 2020");
    expect(harmonizePeriod("2023 à aujourd’hui", "fr")).toBe("2023 – aujourd’hui");
    expect(harmonizePeriod("2023 à ce jour", "fr")).toBe("2023 – aujourd’hui");
    expect(harmonizePeriod("03/2024 - présent", "fr")).toBe("mars 2024 – aujourd’hui");
    expect(harmonizePeriod("Sept. 2019 – déc 2021", "fr")).toBe("septembre 2019 – décembre 2021");
    expect(harmonizePeriod("2015-2019", "fr")).toBe("2015 – 2019");
  });

  it("writes English periods one way: capitalised months, an en dash, “present”", () => {
    expect(harmonizePeriod("January 2020 – June 2024", "en")).toBe("January 2020 – June 2024");
    expect(harmonizePeriod("sept 2019 - jun 2021", "en")).toBe("September 2019 – June 2021");
    expect(harmonizePeriod("2023 to now", "en")).toBe("2023 – present");
  });

  it("never adds a month or a year the CV does not give", () => {
    expect(harmonizePeriod("2022", "fr")).toBe("2022"); // never "janvier 2022"
    expect(harmonizePeriod("2019 - 2021", "en")).toBe("2019 – 2021");
    // A year shared by two months stays shared: "December – January 2025" may start in 2024.
    expect(harmonizePeriod("January – June 2025", "en")).toBe("January – June 2025");
    expect(harmonizePeriod("décembre - janvier 2025", "fr")).toBe("décembre – janvier 2025");
    expect(harmonizePeriod("Mars 2024", "fr")).toBe("mars 2024");
  });

  it("leaves anything it cannot read with certainty exactly as written", () => {
    for (const period of ["Bruxelles, 2019", "depuis 2023", "été 2022", "2019 - 2021 (2 ans)", "janvier - 2025", "juin", "mi-2019", "2024-03", "aujourd'hui - 2025", "janvier – aujourd’hui"]) {
      expect(harmonizePeriod(period, "fr")).toBe(period);
    }
    expect(harmonizePeriod("januari 2020 - juni 2021", "nl")).toBe("januari 2020 - juni 2021"); // other languages: untouched
  });

  it("harmonises every period of a CV, and nothing else", () => {
    const cv: CvDocument = {
      language: "fr",
      name: "Alex",
      headline: null,
      contacts: [],
      experiences: [{ title: "Stage", organisation: "WebAgency", location: "Bruxelles", period: "Février 2025 - Juin 2025", details: ["Juin 2025 : mise en ligne"] }],
      education: [{ title: "42 Belgium", organisation: null, location: null, period: null, details: [] }],
      languages: [],
      skills: [],
    };
    const out = harmonizeCvDates(cv);
    expect(out.experiences[0].period).toBe("février 2025 – juin 2025");
    expect(out.experiences[0].details).toEqual(["Juin 2025 : mise en ligne"]);
    expect(out.education[0].period).toBeNull();
    expect(cv.experiences[0].period).toBe("Février 2025 - Juin 2025"); // the stored CV is not changed
  });
});
