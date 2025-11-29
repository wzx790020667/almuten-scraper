import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";
import { AlmutenScraper, type BirthInfo } from "../src";

// 测试数据
const testBirthInfo: BirthInfo = {
	name: "XXX",
	year: 1995,
	month: 7,
	day: 17,
	hour: 16,
	minute: 50,
	location: "江西省南昌市东湖区",
	latitude: 28.68503,
	longitude: 115.89925,
};

describe("AlmutenScraper", () => {
	let scraper: AlmutenScraper;

	beforeAll(() => {
		scraper = new AlmutenScraper({
			birthInfo: testBirthInfo,
			options: {
				timeout: 60000,
				traditional: true,
				useDualFlyingHouse: true,
				orb: 12
			},
		});
	});

	afterAll(async () => {
		await scraper.close();
	});

	test("should create an instance of AlmutenScraper", () => {
		expect(scraper).toBeInstanceOf(AlmutenScraper);
	});

	describe("fetchPage", () => {
		test("should successfully fetch page content", async () => {
			const result = await scraper.getHoroscopeData();
			console.log("result:", result);
		}, 30000);
	});
});
