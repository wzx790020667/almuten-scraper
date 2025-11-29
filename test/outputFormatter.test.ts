import { describe, test, expect } from "bun:test";
import { outputHouses } from "../src/utils/outputFormatter";

describe("outputFormatter", () => {
    test("should format dual flying houses correctly", () => {
        const mockHouses: any = {
            "1": {
                sign: "Ari",
                rulers: ["Mars"],
                occupants: [],
                flyingTo: ["9", "10"], // Dual flying house
            },
            "2": {
                sign: "Tau",
                rulers: ["Venus"],
                occupants: [],
                flyingTo: ["5"], // Single flying house
            }
        };

        const result = outputHouses(mockHouses);
        
        // Check House 1 output
        expect(result[0]).toContain("1 宫白羊座");
        expect(result[0]).toContain("飞入宫位：(9、10)");
        
        // Check House 2 output
        expect(result[1]).toContain("2 宫金牛座");
        expect(result[1]).toContain("飞入宫位：(5)");
    });
});
