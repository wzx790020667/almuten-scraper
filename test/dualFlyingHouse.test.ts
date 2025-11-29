import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { AlmutenScraper, type BirthInfo } from "../src";

// Test data
const testBirthInfo: BirthInfo = {
	name: "Test",
	year: 1998,
	month: 10,
	day: 3,
	hour: 9,
	minute: 28,
	location: "Test Location",
	latitude: 31.47377,
	longitude: 104.76622,
};

describe("Dual Flying House Logic", () => {
    let scraper: AlmutenScraper;

    test("should include both houses when useDualFlyingHouse is true and planet is moved", async () => {
        scraper = new AlmutenScraper({
            birthInfo: testBirthInfo,
            options: {
                timeout: 60000,
                traditional: true,
                useDualFlyingHouse: true,
                orb: 5.0
            },
        });

        const result = await scraper.getHoroscopeData();
        
        // We need to find a planet that moved by 5 degrees.
        // Based on previous test runs for this date/location:
        // Mars: sign Leo, house 9 (geometric), final 10. moved=true.
        // Mars rules Aries (House 6) and Scorpio (House 1).
        
        // Check House 6 (Aries)
        const house6 = result.houses["6"];
        expect(house6.rulers).toContain("Mars");
        // Should fly to both 9 and 10
        expect(house6.flyingTo).toContain("9");
        expect(house6.flyingTo).toContain("10");
        
        // Check House 1 (Scorpio)
        const house1 = result.houses["1"];
        expect(house1.rulers).toContain("Mars"); // Pluto and Mars
        // Should fly to both 9 and 10
        expect(house1.flyingTo).toContain("9");
        expect(house1.flyingTo).toContain("10");
    });

    test("should only include final house when useDualFlyingHouse is false", async () => {
        scraper = new AlmutenScraper({
            birthInfo: testBirthInfo,
            options: {
                timeout: 60000,
                traditional: true,
                useDualFlyingHouse: false, // Default
                orb: 5.0
            },
        });

        const result = await scraper.getHoroscopeData();
        
        // Mars: sign Leo, house 9 (geometric), final 10. moved=true.
        
        // Check House 6 (Aries)
        const house6 = result.houses["6"];
        expect(house6.rulers).toContain("Mars");
        // Should fly to 10 only (final house)
        expect(house6.flyingTo).toContain("10");
        expect(house6.flyingTo).not.toContain("9");
    });
});
