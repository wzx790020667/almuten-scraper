import type { FEATURES, HOUSES, PLANETS } from "../settings/constants";
import type { Aspect, GrandCross, GrandTrine, Kite, Stellium, TSquare } from "../settings/types";
import * as zhTranslations from "../i18n/zh.json";

/**
 * 将行星数据转换为格式化的字符串数组
 * @param planets 行星数据
 * @returns 格式化的字符串数组
 */
export const outputPlanets = (planets: typeof PLANETS) => {
	const result: string[] = [];

	for (const [planetName, planetData] of Object.entries(planets)) {
		// 跳过没有星座数据的行星
		if (!planetData.sign) continue;

		// 获取星座中文名称
		const signChineseName = zhTranslations[planetData.sign as keyof typeof zhTranslations] || planetData.sign;

		const planetChineseName = zhTranslations[planetName as keyof typeof zhTranslations] || planetName;

		// 构建相位描述
		const aspectDescriptions: string[] = [];
		if (planetData.aspects && planetData.aspects.length > 0) {
			for (const aspect of planetData.aspects) {
				const targetPlanetName = aspect.to;
				const targetPlanetChineseName =
					zhTranslations[targetPlanetName as keyof typeof zhTranslations] || targetPlanetName;
				const aspectTypeChineseName = zhTranslations[aspect.type as keyof typeof zhTranslations] || aspect.type;

				aspectDescriptions.push(`与${targetPlanetChineseName}成${aspectTypeChineseName}`);
			}
		}

		// 构建完整的行星描述
		const planetDescription = `${planetChineseName}, 星座：${signChineseName}, 宫位：${planetData.house || "未知"}, ${
			planetData.score || 0
		}分${aspectDescriptions.length > 0 ? "，相位：" + aspectDescriptions.join(", ") : ""}`;

		result.push(planetDescription);
	}

	return result;
};

/**
 * 将宫位数据转换为格式化的字符串数组
 * @param houses 宫位数据
 * @returns 格式化的字符串数组
 */
export const outputHouses = (houses: typeof HOUSES) => {
	const result: string[] = [];

	for (const [houseNumber, houseData] of Object.entries(houses)) {
		// 跳过没有星座数据的宫位
		if (!houseData.sign) continue;

		// 获取星座中文名称
		const signChineseName = zhTranslations[houseData.sign as keyof typeof zhTranslations] || houseData.sign;

		// 构建落入行星描述
		let occupantsDesc = "";
		if (houseData.occupants && houseData.occupants.length > 0) {
			const occupantNames = houseData.occupants.map(planet => {
				return zhTranslations[planet as keyof typeof zhTranslations] || planet;
			});
			occupantsDesc = `落入行星：${occupantNames.join("、")}`;
		}

		// 构建飞入宫位描述
		let flyingToDesc = "";
		if (houseData.flyingTo) {
			const flyingToHouse = typeof houseData.flyingTo === "number" ? houseData.flyingTo : houseData.flyingTo;
			flyingToDesc = `飞入宫位：${flyingToHouse}`;
		}

		let rulers = "";
		if (houseData.rulers && houseData.rulers.length > 0) {
			const rulerNames = houseData.rulers.map(planet => {
				return zhTranslations[planet as keyof typeof zhTranslations] || planet;
			});
			rulers = `宫主星：${rulerNames.join("、")}`;
		}

		// 构建完整的宫位描述
		const houseDescription = `${houseNumber} 宫${signChineseName}座, ${rulers} ${
			occupantsDesc ? "," + occupantsDesc : ""
		}${flyingToDesc ? "," + flyingToDesc : ""}`;

		result.push(houseDescription);
	}

	return result;
};

/**
 * 将格局数据转换为格式化的字符串数组
 * @param patterns 格局数据数组 [大三角, 大十字, 风筝, 星群]
 * @returns 格式化的字符串数组
 */
export const outputPatterns = (patterns: [GrandTrine[], GrandCross[], Kite[], Stellium[]]) => {
	const result: string[] = [];

	// 处理大三角格局
	const grandTrines = patterns[0];
	if (grandTrines && grandTrines.length > 0) {
		const trineDescriptions = grandTrines.map(trine => {
			const planetNames = trine.points.map(planet => {
				return zhTranslations[planet as keyof typeof zhTranslations] || planet;
			});
			return `（${planetNames.join(",")}）`;
		});
		result.push(`大三角：${trineDescriptions.join(", ")}`);
	} else {
		result.push("大三角：无");
	}

	// 处理T三角格局
	// const tSquares = patterns[4];
	// if (tSquares && tSquares.length > 0) {
	// 	const tSquareDescriptions = tSquares.map(tSquare => {
	// 		const planetNames = tSquare.points.map(planet => {
	// 			return zhTranslations[planet as keyof typeof zhTranslations] || planet;
	// 		});
	// 		return `（${planetNames.join(",")}）`;
	// 	});
	// 	result.push(`T三角：${tSquareDescriptions.join(", ")}`);
	// } else {
	// 	result.push("T三角：无");
	// }

	// 处理大十字格局
	const grandCrosses = patterns[1];
	if (grandCrosses && grandCrosses.length > 0) {
		const crossDescriptions = grandCrosses.map(cross => {
			const planetNames = cross.points.map(planet => {
				return zhTranslations[planet as keyof typeof zhTranslations] || planet;
			});
			return `（${planetNames.join(",")}）`;
		});
		result.push(`大十字：${crossDescriptions.join(", ")}`);
	} else {
		result.push("大十字：无");
	}

	// 处理星群格局
	const stelliums = patterns[3];
	if (stelliums && stelliums.length > 0) {
		const stelliumDescriptions = stelliums.map(stellium => {
			const planetNames = stellium.points.map(planet => {
				return zhTranslations[planet as keyof typeof zhTranslations] || planet;
			});

			// 获取星座或宫位的中文名称
			let locationName = stellium.location;
			if (stellium.type === "sign") {
				locationName = zhTranslations[stellium.location as keyof typeof zhTranslations] || stellium.location;
			}

			return `${locationName}座,（${planetNames.join(",")}）,数量：${stellium.count}`;
		});
		result.push(`星群格局：${stelliumDescriptions.join(", ")}`);
	} else {
		result.push("星群格局：无");
	}

	return result;
};

/**
 * 将特征数据转换为格式化的字符串数组
 * @param features 特征数据数组
 * @returns 格式化的字符串数组
 */
export const outputFeatures = (features: typeof FEATURES) => {
	const result: string[] = [];

	if (features && features.length > 0) {
		// 遍历所有特征并添加到结果数组
		for (const feature of features) {
			result.push(feature);
		}
	} else {
		result.push("特征：无");
	}

	return result;
};
