import { describe, expect, it } from "vitest";
import { explanationTranscript } from "../mytuta/data/audioText";

describe("spoken explanations", () => {
  it("speaks fractions, density and powers without mathematics markup", () => {
    expect(explanationTranscript(String.raw`$\rho = \frac{mass}{volume}$ in cm^3`))
      .toBe("density = mass divided by volume in cm cubed");
  });
});
