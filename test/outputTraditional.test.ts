import { describe, test, expect } from "bun:test";
import { outputHouses } from "../src/utils/outputFormatter";

describe("Output Formatter - Traditional Mode", () => {
    test("should filter outer planets when traditional is true", () => {
        const mockHouses: any = {
            "1": {
                sign: "Ari",
                rulers: ["Mars", "Pluto"], // Pluto is outer
                occupants: ["Uranus", "Sun"], // Uranus is outer
                flyingTo: "1"
            }
        };

        const result = outputHouses(mockHouses, { traditional: true });
        
        // Should contain Mars and Sun
        expect(result[0]).toContain("火星");
        expect(result[0]).toContain("太阳");
        
        // Should NOT contain Pluto or Uranus
        expect(result[0]).not.toContain("冥王星");
        expect(result[0]).not.toContain("天王星");
    });

    test("should include outer planets when traditional is false or undefined", () => {
        const mockHouses: any = {
            "1": {
                sign: "Ari",
                rulers: ["Mars", "Pluto"],
                occupants: ["Uranus", "Sun"],
                flyingTo: "1"
            }
        };

        const result = outputHouses(mockHouses, { traditional: false });
        
        // Should contain all
        expect(result[0]).toContain("冥王星");
        expect(result[0]).toContain("天王星");
    });
});
