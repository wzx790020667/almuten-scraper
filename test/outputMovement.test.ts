import { describe, test, expect } from "bun:test";
import { outputPlanets } from "../src/utils/outputFormatter";
import { PLANETS } from "../src/settings/constants";
import { cloneDeep, set } from "lodash";

describe("Output Formatter - Planet Movement", () => {
    test("should format planet movement correctly", () => {
        const planets = cloneDeep(PLANETS);
        set(planets, "Mars.sign", "Leo");
        set(planets, "Mars.house", "9");
        set(planets, "Mars.is_moved_by_5_deg", true);
        set(planets, "Mars.geometric_house", 9);
        set(planets, "Mars.final_house", 10);
        
        const result = outputPlanets(planets);
        const marsOutput = result.find(s => s.startsWith("火星"));
        expect(marsOutput).toContain("(跨越 9宫 -> 10宫)");
    });

    test("should not show movement info if not moved", () => {
        const planets = cloneDeep(PLANETS);
        set(planets, "Mars.sign", "Leo");
        set(planets, "Mars.house", "9");
        set(planets, "Mars.is_moved_by_5_deg", false);
        set(planets, "Mars.geometric_house", 9);
        set(planets, "Mars.final_house", 9);
        
        const result = outputPlanets(planets);
        const marsOutput = result.find(s => s.startsWith("火星"));
        expect(marsOutput).not.toContain("跨越");
    });
});
