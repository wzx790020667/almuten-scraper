import { describe, test, expect } from "bun:test";
import { outputInterceptions, outputPlanets } from "../src/utils/outputFormatter";
import { PLANETS } from "../src/settings/constants";
import { cloneDeep, set } from "lodash";

describe("Output Formatter - Interceptions", () => {
    test("should format intercepted chains correctly", () => {
        const chains = [
            {
                container_house_idx: 9,
                intercepted_sign_idx: 0, // Aries
                house_span_degrees: 35.5
            }
        ];
        
        const result = outputInterceptions(chains);
        expect(result[0]).toContain("宫位 9");
        expect(result[0]).toContain("跨度 35.50°");
        expect(result[0]).toContain("截夺了 白羊座");
    });

    test("should format planet interception status", () => {
        const planets = cloneDeep(PLANETS);
        set(planets, "Mars.sign", "Ari");
        set(planets, "Mars.house", "9");
        set(planets, "Mars.is_intercepted", true);
        
        const result = outputPlanets(planets);
        const marsOutput = result.find(s => s.startsWith("火星"));
        expect(marsOutput).toContain("(被截夺)");
    });

    test("should not show interception status if false", () => {
        const planets = cloneDeep(PLANETS);
        set(planets, "Mars.sign", "Ari");
        set(planets, "Mars.house", "9");
        set(planets, "Mars.is_intercepted", false);
        
        const result = outputPlanets(planets);
        const marsOutput = result.find(s => s.startsWith("火星"));
        expect(marsOutput).not.toContain("(被截夺)");
    });
});
