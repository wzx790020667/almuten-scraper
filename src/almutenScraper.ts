import axios from "axios";
import * as cheerio from "cheerio";
import { type ScraperConfig } from "./types";
import { formatCoordinates } from "./utils/dateFormatter";
import { TimezoneHelper } from "./utils/timezoneHelper";
import { ASPECT_GRIDS, FEATURES, HOUSES, PLANETS } from "./settings/constants";
import { cloneDeep, get, set } from "lodash";
import { CHAR_TO_ASPECT, CHAR_TO_PLANET, CHAR_TO_SIGN, SIGN_TO_RULERS } from "./settings/mappingTable";
import type { Aspect, GrandCross, GrandTrine, Kite, Stellium } from "./settings/types";
import { caclulateGrandTrine, calculateGrandCross, calculateKite, calculateStellium } from "./utils/patternCalculator";
import { calculateBidirectionalAspects } from "./utils/aspectCalculator";
import { outputFeatures, outputHouses, outputPatterns, outputPlanets } from "./utils/outputFormatter";
import zhTranslations from "./i18n/zh.json";
import { EXCLUDED_CELESTIALS } from "./settings/constants";

/**
 * AlmutenScraper 类 - 用于从almuten.net爬取星盘数据
 */
export class AlmutenScraper {
	/**
	 * 爬虫配置
	 */
	private config: ScraperConfig;

	/**
	 * 构造函数
	 * @param options 爬虫选项
	 */
	constructor(config: ScraperConfig) {
		this.config = config;
	}

	/**
	 * 发送HTTP请求获取页面内容
	 * @private
	 */
	public async fetchPage(url: string): Promise<string> {
		// 转换经纬度格式
		const { latDegrees, latMinutes, latDirection, lonDegrees, lonMinutes, lonDirection } = formatCoordinates(
			this.config.birthInfo.latitude,
			this.config.birthInfo.longitude
		);

		const payload = {
			name: this.config.birthInfo.name,
			year: this.config.birthInfo.year,
			month: this.config.birthInfo.month,
			day: this.config.birthInfo.day,
			hour: this.config.birthInfo.hour,
			min: this.config.birthInfo.minute,
			location: this.config.birthInfo.location,
			glon_deg: lonDegrees,
			glon_dir: lonDirection,
			glon_min: lonMinutes,
			glat_deg: latDegrees,
			glat_dir: latDirection,
			glat_min: latMinutes,
			toffset: TimezoneHelper.getTimezoneOffsetByCoordinates(
				this.config.birthInfo.latitude,
				this.config.birthInfo.longitude
			),
			hsys: "P",
			submit: "更新星图",
		};

		const formData = new URLSearchParams();
		Object.entries(payload).forEach(([key, value]) => {
			formData.append(key, String(value));
		});

		const response = await axios.post(url, formData, {
			timeout: this.config.options?.timeout || 5000,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				"Content-Type": "application/x-www-form-urlencoded",
				"Accept-Language": "zh-CN,zh;q=0.9",
			},
		});

		return response.data;
	}

	/**
	 * 关闭（保持接口兼容性）
	 */
	public async close(): Promise<void> {
		// 使用axios不需要关闭连接
	}

	/**
	 * 获取相位数据
	 */
	public injectAspectsData($: cheerio.CheerioAPI, planets: typeof PLANETS) {
		for (const planetAspects of ASPECT_GRIDS) {
			let fromPlanet = null;
			const aspects: Aspect[] = [];

			for (const col of planetAspects) {
				const [fromChar, toChar, aspectX, aspectY, labelY] = col;

				// 获取相位关系
				const aspect = $(`[x=${aspectX}][y=${aspectY}]`).text();

				// 如果有相位，则添加到行星数据中
				if (aspect) {
					fromPlanet = get(CHAR_TO_PLANET, fromChar);
					const toPlanet = get(CHAR_TO_PLANET, toChar);
					const aspectType = get(CHAR_TO_ASPECT, aspect);
					const aspectLabel = $(`[x=${aspectX}][y=${labelY}]`).text();

					aspects.push({ to: toPlanet, type: aspectType, orb: aspectLabel });
				}
			}

			if (fromPlanet) {
				set(planets, [fromPlanet, "aspects"], aspects);
			}
		}
	}

	/**
	 * 获取行星数据
	 */
	public injectPlanetsInfo($: cheerio.CheerioAPI, planets: typeof PLANETS) {
		const table = $('div.list_table[style="clear: both; width: 100%; "] table').first();
		const trs = table.find("tr");

		for (let i = 0; i < trs.length; i++) {
			if (i > 1) {
				// 获取行星信息（行星名称、符号、宫位、度数）
				const tr = trs[i];
				const tds = $(tr).find("td");
				const planetChar = $(tds[0]).find("em").text();
				const signChar = $(tds[2]).text();
				const houseNum = $(tds[5]).text();
				const degree = $(tds[1]).text();
				const degreeDecimal = $(tds[3]).text();
				const score = $(tds[17]).text();

				// 获取行星名称和星座
				const planet = get(CHAR_TO_PLANET, planetChar);
				const sign = get(CHAR_TO_SIGN, signChar);

				set(planets, [planet, "sign"], sign);
				set(planets, [planet, "house"], houseNum);
				set(planets, [planet, "pos"], `${degree}°${degreeDecimal}`);

				if (i <= 8) {
					// 排除三王星和其他占星点
					set(planets, [planet, "score"], score);
				}
			}
		}
	}

	/**
	 * 获取宫位数据
	 */
	public injectHousesInfo($: cheerio.CheerioAPI, houses: typeof HOUSES) {
		const table = $('div.list_table[style="float: left; width: 32%; "] table').first();
		const trs = table.find("tr");

		for (let i = 0; i < trs.length; i++) {
			if (i > 0) {
				// 获取宫位信息（宫位名称、符号、度数）
				const tr = trs[i];
				const tds = $(tr).find("td");
				const houseNum = $(tds[0]).text();
				const signChar = $(tds[2]).find("em").text();
				const degree = $(tds[1]).text();
				const degreeDecimal = $(tds[3]).text();

				const sign = get(CHAR_TO_SIGN, signChar);
				const rulers = get(SIGN_TO_RULERS, sign);

				set(houses, [houseNum, "sign"], sign);
				set(houses, [houseNum, "rulers"], rulers);
				set(houses, [houseNum, "cusp"], `${degree}°${degreeDecimal}`);
			}
		}
	}

	/**
	 * 填入行星特征数据
	 */
	public injectFeatureInfo($: cheerio.CheerioAPI, features: typeof FEATURES) {
		const tables = $('div.list_table[style="float: left; width: 32%; "] table');
		const trs = $(tables[1]).find("tr");

		for (let i = 0; i < trs.length; i++) {
			if (i > 0) {
				const tr = trs[i];
				const tds = $(tr).find("td");

				// 获取所有 <em> 标签中的字符并转换为行星名称
				const planetChars = tds
					.find("em")
					.map((_, el) => $(el).text())
					.get();
				const planetNames = planetChars.map(char => get(CHAR_TO_PLANET, char)).filter(Boolean);
				const planetNamesZh = planetNames.map(name => get(zhTranslations, name));

				// 获取完整的特征文本
				let text = tds.text();

				// 替换文本中的行星字符为中文行星名称
				planetChars.forEach((char, index) => {
					if (planetNamesZh[index]) {
						text = text.replace(char, planetNamesZh[index]);
					}
				});

				// 添加特征到特征列表, 只考虑接纳与互容
				if (text.indexOf("本垣") > -1 || text.indexOf("曜升") > -1) {
					text = text.replace("本垣", "庙");
					text = text.replace("曜升", "旺");
					features.push(text);
				}
			}
		}
	}

	/**
	 * 飞宫计算
	 */
	public calculateFlyingHouse(planets: typeof PLANETS, houses: typeof HOUSES) {
		const houseEntries = Object.entries(houses);
		const excludeOuterPlanets = this.config.options?.traditional || false;

		for (const [houseNum, house] of houseEntries) {
			if (house.sign) {
				// Get rulers for the sign
				let rulers: string[] = get(SIGN_TO_RULERS, house.sign);

				// Filter out excluded celestials if traditional mode is enabled
				if (excludeOuterPlanets) {
					rulers = rulers.filter(ruler => !EXCLUDED_CELESTIALS.includes(ruler));
				}

				const toHouses = [];
				for (const ruler of rulers) {
					const toHouse = get(planets, ruler).house;
					if (toHouse) {
						toHouses.push(toHouse);
					}
				}

				if (toHouses.length > 0) {
					set(houses, [houseNum, "flyingTo"], toHouses);
				}
			}
		}
	}

	/**
	 * 格局计算
	 */
	public calculatePattern(planets: typeof PLANETS): [GrandTrine[], GrandCross[], Kite[], Stellium[]] {
		// 计算行星格局
		const grandTrines = caclulateGrandTrine(planets);
		// const tsquares = calculateTSquare(planets);
		const grandCross = calculateGrandCross(planets);
		const kites = calculateKite(planets, grandTrines);
		const stelliums = calculateStellium(planets);
		return [grandTrines, grandCross, kites, stelliums];
	}

	/**
	 * 从页面中提取星盘数据
	 * @private
	 */
	public async getHoroscopeData() {
		const html = await this.fetchPage("https://almuten.net");

		if (!html) {
			throw new Error("Failed to fetch page");
		}

		const $ = cheerio.load(html);

		// Init plant data
		const planets = cloneDeep(PLANETS);
		this.injectAspectsData($, planets);
		this.injectPlanetsInfo($, planets);

		// 计算行星相位的双向关系
		calculateBidirectionalAspects(planets);

		const houses = cloneDeep(HOUSES);
		this.injectHousesInfo($, houses);
		this.calculateFlyingHouse(planets, houses);

		const features = cloneDeep(FEATURES);
		this.injectFeatureInfo($, features);

		const patterns = this.calculatePattern(planets);

		const planetsOutput = outputPlanets(planets);
		const housesOutput = outputHouses(houses);
		const patternsOutput = outputPatterns(patterns);
		const featuresOutput = outputFeatures(features);

		return {
			planets,
			houses,
			patterns,
			features,
			planetsOutput: planetsOutput,
			housesOutput: housesOutput,
			patternsOutput: patternsOutput,
			featuresOutput: featuresOutput,
		};
	}
}
