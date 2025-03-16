/**
 * Almuten Scraper
 * 一个用于从 almuten.net 爬取星盘数据的工具
 *
 * @module almuten-scraper
 */

/**
 * 获取星盘数据的快捷函数
 * @param birthInfo 出生信息
 * @param options 爬虫选项
 * @returns Promise<HoroscopeData> 星盘数据
 */

// 导出所有类型和工具函数
export { AlmutenScraper } from "./almutenScraper";
export { formatDate, validateDate, formatCoordinates } from "./utils/dateFormatter";
export {
	type BirthInfo,
	type HoroscopeData,
	type ScraperOptions,
	type PlanetInfo,
	type HouseInfo,
	type AspectInfo,
} from "./types";
