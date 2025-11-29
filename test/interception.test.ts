import { describe, test, expect } from "bun:test";
import {
  calculateInterceptions,
  calculatePlanetPlacement,
  normalizeDegree,
  getAbsoluteLongitude,
  getSignIndex,
} from "../src/utils/interceptionCalculator";

describe("Interception Calculator", () => {
  describe("normalizeDegree", () => {
    test("should normalize degree string", () => {
      expect(normalizeDegree("25°30")).toBe(25.5);
      expect(normalizeDegree("0°0")).toBe(0);
      expect(normalizeDegree("29°59")).toBeCloseTo(29.9833, 4);
    });
  });

  describe("calculateInterceptions", () => {
    test("should identify intercepted signs", () => {
      // Scenario: Aries (0) is intercepted in House 1.
      // House 1 starts at Pisces 25° (355°) and ends at Taurus 5° (35°).
      // Aries (0-30) is fully contained within 355-35 (wrapped).
      
      const houseCusps = [
        { houseNum: 1, sign: "Pis", degree: 25 }, // 355
        { houseNum: 2, sign: "Tau", degree: 5 },  // 35
        { houseNum: 3, sign: "Gem", degree: 5 },
        { houseNum: 4, sign: "Can", degree: 5 },
        { houseNum: 5, sign: "Leo", degree: 5 },
        { houseNum: 6, sign: "Vir", degree: 5 },
        { houseNum: 7, sign: "Vir", degree: 25 }, // Opposite 1
        { houseNum: 8, sign: "Sco", degree: 5 },
        { houseNum: 9, sign: "Sag", degree: 5 },
        { houseNum: 10, sign: "Cap", degree: 5 },
        { houseNum: 11, sign: "Aqu", degree: 5 },
        { houseNum: 12, sign: "Pis", degree: 5 },
      ];

      const result = calculateInterceptions(houseCusps);
      
      // Aries (0) should be intercepted in House 1
      // Libra (6) should be intercepted in House 7 (Vir 25 -> Sco 5)
      
      const ariesIntercept = result.interceptedChains.find(c => c.intercepted_sign_idx === 0);
      expect(ariesIntercept).toBeDefined();
      expect(ariesIntercept?.container_house_idx).toBe(1);
      
      const libraIntercept = result.interceptedChains.find(c => c.intercepted_sign_idx === 6);
      expect(libraIntercept).toBeDefined();
      expect(libraIntercept?.container_house_idx).toBe(7);
      
      expect(result.interceptedSigns.has(0)).toBe(true);
      expect(result.interceptedSigns.has(6)).toBe(true);
    });
  });

  describe("calculatePlanetPlacement", () => {
    const houseCusps = [
      { houseNum: 1, sign: "Ari", degree: 0 }, // 0
      { houseNum: 2, sign: "Tau", degree: 0 }, // 30
      { houseNum: 3, sign: "Gem", degree: 0 }, // 60
      // ... simplified equal houses for basic testing
      { houseNum: 4, sign: "Can", degree: 0 },
      { houseNum: 5, sign: "Leo", degree: 0 },
      { houseNum: 6, sign: "Vir", degree: 0 },
      { houseNum: 7, sign: "Lib", degree: 0 },
      { houseNum: 8, sign: "Sco", degree: 0 },
      { houseNum: 9, sign: "Sag", degree: 0 },
      { houseNum: 10, sign: "Cap", degree: 0 },
      { houseNum: 11, sign: "Aqu", degree: 0 },
      { houseNum: 12, sign: "Pis", degree: 0 },
    ];
    const interceptedSigns = new Set<number>();

    test("should place planet in correct geometric house", () => {
      // Planet at Ari 10° -> House 1
      const result = calculatePlanetPlacement("Mars", "Ari", 10, houseCusps, interceptedSigns);
      expect(result.geometric_house).toBe(1);
      expect(result.final_house).toBe(1);
      expect(result.is_moved_by_5_deg).toBe(false);
    });

    test("should apply 5-degree rule", () => {
      // Planet at Ari 28° -> Next cusp is Tau 0° (30°). Distance is 2°.
      // Should move to House 2.
      const result = calculatePlanetPlacement("Mars", "Ari", 28, houseCusps, interceptedSigns);
      expect(result.geometric_house).toBe(1);
      expect(result.final_house).toBe(2);
      expect(result.is_moved_by_5_deg).toBe(true);
    });

    test("should check interception status", () => {
      const interceptedSignsWithAries = new Set<number>([0]); // Aries intercepted
      
      const result = calculatePlanetPlacement("Mars", "Ari", 10, houseCusps, interceptedSignsWithAries);
      expect(result.is_intercepted).toBe(true);
    });
    
    test("should check interception status even if moved by 5-degree rule", () => {
        const interceptedSignsWithAries = new Set<number>([0]); // Aries intercepted
        
        // Planet at Ari 28° (Intercepted Sign) -> Moves to House 2
        // Should still be intercepted
        const result = calculatePlanetPlacement("Mars", "Ari", 28, houseCusps, interceptedSignsWithAries);
        expect(result.final_house).toBe(2);
        expect(result.is_moved_by_5_deg).toBe(true);
        expect(result.is_intercepted).toBe(true);
    });

    test("should respect custom orb", () => {
      // Planet at Ari 28°. Next cusp is Tau 0° (30°). Distance is 2°.
      // If orb is 1°, it should NOT move.
      const result = calculatePlanetPlacement("Mars", "Ari", 28, houseCusps, interceptedSigns, 1.0);
      expect(result.geometric_house).toBe(1);
      expect(result.final_house).toBe(1);
      expect(result.is_moved_by_5_deg).toBe(false);

      // If orb is 3°, it SHOULD move.
      const result2 = calculatePlanetPlacement("Mars", "Ari", 28, houseCusps, interceptedSigns, 3.0);
      expect(result2.final_house).toBe(2);
      expect(result2.is_moved_by_5_deg).toBe(true);
    });
  });
});
