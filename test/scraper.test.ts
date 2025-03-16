import { describe, test, expect, beforeAll, afterAll, mock } from "bun:test";
import { AlmutenScraper, type BirthInfo } from "../src";

// 测试数据
const testBirthInfo: BirthInfo = {
	name: "张三",
	year: 1995,
	month: 7,
	day: 17,
	hour: 16,
	minute: 50,
	location: "北京市东城区",
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

		test("should handle request error with invalid URL", async () => {
			await expect(scraper.fetchPage("https://invalid-url-that-does-not-exist.com")).rejects.toThrow();
		});
	});
});
