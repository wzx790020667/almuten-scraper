import { Combination } from "js-combinatorics";
import { EXCLUDED_CELESTIALS, type PLANETS } from "../settings/constants";
import type { GrandCross, GrandTrine, Kite, Stellium, TSquare } from "../settings/types";

/**
 * 计算大三角格局
 * @param planets 行星数据
 */
export const caclulateGrandTrine = (planets: typeof PLANETS): GrandTrine[] => {
	const grandTrines = [];
	// 过滤掉不参与计算的天体
	const filteredPlanets = Object.entries(planets).filter(([planetName]) => !EXCLUDED_CELESTIALS.includes(planetName));
	const combinations = new Combination(filteredPlanets, 3);

	for (const points of combinations) {
		const [p1, p2, p3] = points;
		const [planet1Name, planet1Data] = p1;
		const [planet2Name, planet2Data] = p2;
		const [planet3Name, planet3Data] = p3;

		// 检查三个行星之间是否都形成Trine相位
		const p1ToP2Trine = planet1Data.aspects?.some(aspect => aspect.to === planet2Name && aspect.type === "Trine");
		const p2ToP3Trine = planet2Data.aspects?.some(aspect => aspect.to === planet3Name && aspect.type === "Trine");
		const p3ToP1Trine = planet3Data.aspects?.some(aspect => aspect.to === planet1Name && aspect.type === "Trine");

		if (p1ToP2Trine && p2ToP3Trine && p3ToP1Trine) {
			grandTrines.push({
				points: [planet1Name, planet2Name, planet3Name],
			});
		}
	}

	return grandTrines;
};

/**
 * 计算风筝格局
 * @param planets 行星数据
 * @param grandTrines 大三角格局列表
 */
export const calculateKite = (planets: typeof PLANETS, grandTrines: ReturnType<typeof caclulateGrandTrine>): Kite[] => {
	const kites = [];

	// 遍历每个大三角格局
	for (const grandTrine of grandTrines) {
		const trinePoints = grandTrine.points;

		// 遍历大三角的每个顶点
		for (const vertex of trinePoints) {
			const vertexData = planets[vertex as keyof typeof planets];

			// 检查所有行星，寻找与顶点形成对冲相位的行星
			// 过滤掉不参与计算的天体
			for (const [planetName, planetData] of Object.entries(planets).filter(
				([name]) => !EXCLUDED_CELESTIALS.includes(name)
			)) {
				// 跳过已经在大三角中的行星
				if (trinePoints.includes(planetName)) {
					continue;
				}

				// 检查是否形成对冲相位
				const hasOpposition = vertexData.aspects?.some(
					aspect => aspect.to === planetName && aspect.type === "Opposition"
				);

				if (hasOpposition) {
					// 找到风筝格局，添加到结果列表
					kites.push({
						points: [...trinePoints, planetName],
						vertex,
						oppositionPoint: planetName,
					});
				}
			}
		}
	}

	return kites;
};

/**
 * 计算大十字格局
 * @param planets 行星数据
 */
export const calculateGrandCross = (planets: typeof PLANETS): GrandCross[] => {
	const grandCrosses = [];
	// 过滤掉不参与计算的天体
	const filteredPlanets = Object.entries(planets).filter(([planetName]) => !EXCLUDED_CELESTIALS.includes(planetName));
	const combinations = new Combination(filteredPlanets, 4);

	for (const points of combinations) {
		const [p1, p2, p3, p4] = points;
		const [planet1Name, planet1Data] = p1;
		const [planet2Name, planet2Data] = p2;
		const [planet3Name, planet3Data] = p3;
		const [planet4Name, planet4Data] = p4;

		// 检查两组对冲相位（p1-p3, p2-p4）
		const p1ToP3Opposition = planet1Data.aspects?.some(
			aspect => aspect.to === planet3Name && aspect.type === "Opposition"
		);
		const p2ToP4Opposition = planet2Data.aspects?.some(
			aspect => aspect.to === planet4Name && aspect.type === "Opposition"
		);

		// 如果没有形成对冲相位，跳过这个组合
		if (!p1ToP3Opposition || !p2ToP4Opposition) {
			continue;
		}

		// 检查四组刑相位（p1-p2, p2-p3, p3-p4, p4-p1）
		const p1ToP2Square = planet1Data.aspects?.some(aspect => aspect.to === planet2Name && aspect.type === "Square");
		const p2ToP3Square = planet2Data.aspects?.some(aspect => aspect.to === planet3Name && aspect.type === "Square");
		const p3ToP4Square = planet3Data.aspects?.some(aspect => aspect.to === planet4Name && aspect.type === "Square");
		const p4ToP1Square = planet4Data.aspects?.some(aspect => aspect.to === planet1Name && aspect.type === "Square");

		// 如果形成完整的大十字格局，添加到结果列表
		if (p1ToP2Square && p2ToP3Square && p3ToP4Square && p4ToP1Square) {
			grandCrosses.push({
				points: [planet1Name, planet2Name, planet3Name, planet4Name],
				oppositionPairs: [
					[planet1Name, planet3Name],
					[planet2Name, planet4Name],
				],
			});
		}
	}

	return grandCrosses;
};

/**
 * 计算星群格局
 * @param planets 行星数据
 */
export const calculateStellium = (planets: typeof PLANETS): Stellium[] => {
	const stelliums: Stellium[] = [];
	const personalPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars"];

	// 按星座分组
	const signGroups: Record<string, Array<[string, any]>> = {};
	// 过滤掉不参与计算的天体
	for (const [planetName, planetData] of Object.entries(planets).filter(
		([name]) => !EXCLUDED_CELESTIALS.includes(name)
	)) {
		if (!planetData.sign) continue;
		if (!signGroups[planetData.sign]) {
			signGroups[planetData.sign] = [];
		}
		signGroups[planetData.sign].push([planetName, planetData]);
	}

	// 按宫位分组
	const houseGroups: Record<string, Array<[string, any]>> = {};
	// 过滤掉不参与计算的天体
	for (const [planetName, planetData] of Object.entries(planets).filter(
		([name]) => !EXCLUDED_CELESTIALS.includes(name)
	)) {
		if (!planetData.house) continue;
		if (!houseGroups[planetData.house]) {
			houseGroups[planetData.house] = [];
		}
		houseGroups[planetData.house].push([planetName, planetData]);
	}

	// 检查每个星座分组
	for (const [sign, points] of Object.entries(signGroups)) {
		// 检查数量要求（≥3颗行星）
		if (points.length < 3) continue;

		// 检查是否包含至少一颗个人行星
		const hasPersonalPlanet = points.some(([planetName]) => personalPlanets.includes(planetName));
		if (!hasPersonalPlanet) continue;

		// 检查容许度（15度范围内）
		const positions = points.map(([_, planetData]) => {
			const [degrees, minutes] = planetData.pos.split("°");
			return parseFloat(degrees) + parseFloat(minutes) / 60;
		});
		const minPos = Math.min(...positions);
		const maxPos = Math.max(...positions);
		if (maxPos - minPos > 15) continue;

		// 添加到结果列表
		stelliums.push({
			type: "sign",
			location: sign,
			points: points.map(([planetName]) => planetName),
			count: points.length,
		});
	}

	// 检查每个宫位分组
	for (const [house, points] of Object.entries(houseGroups)) {
		// 检查数量要求（≥3颗行星）
		if (points.length < 3) continue;

		// 检查是否包含至少一颗个人行星
		const hasPersonalPlanet = points.some(([planetName]) => personalPlanets.includes(planetName));
		if (!hasPersonalPlanet) continue;

		// 检查容许度（宫位跨度的1/3范围内）
		// 假设每个宫位跨度为30度
		const houseOrb = 30 / 3; // 10度

		// 计算每个天体在宫位内的相对位置
		const housePositions = points.map(([_, planetData]) => {
			const [degrees, minutes] = planetData.pos.split("°");
			const absPos = parseFloat(degrees) + parseFloat(minutes) / 60;
			return absPos % 30; // 假设每个宫位30度
		});

		// 检查是否在容许度范围内
		const minPos = Math.min(...housePositions);
		const maxPos = Math.max(...housePositions);
		if (maxPos - minPos > houseOrb) continue;

		// 添加到结果列表
		stelliums.push({
			type: "house",
			location: house,
			points: points.map(([planetName]) => planetName),
			count: points.length,
		});
	}

	return stelliums;
};

/**
 * 计算T三角格局
 * @param planets 行星数据
 */
export const calculateTSquare = (planets: typeof PLANETS): TSquare[] => {
	const tSquares = [];
	// 过滤掉不参与计算的天体
	const filteredPlanets = Object.entries(planets).filter(([planetName]) => !EXCLUDED_CELESTIALS.includes(planetName));
	const combinations = new Combination(filteredPlanets, 3);

	for (const points of combinations) {
		const [p1, p2, p3] = points;
		const [planet1Name, planet1Data] = p1;
		const [planet2Name, planet2Data] = p2;
		const [planet3Name, planet3Data] = p3;

		// 检查p1和p2是否形成对冲相位
		const p1ToP2Opposition = planet1Data.aspects?.some(
			aspect => aspect.to === planet2Name && aspect.type === "Opposition"
		);

		// 如果p1和p2没有形成对冲相位，检查其他组合
		if (!p1ToP2Opposition) {
			continue;
		}

		// 检查p3是否与p1和p2都形成刑相位
		const p1ToP3Square = planet1Data.aspects?.some(aspect => aspect.to === planet3Name && aspect.type === "Square");
		const p2ToP3Square = planet2Data.aspects?.some(aspect => aspect.to === planet3Name && aspect.type === "Square");

		// 如果形成完整的T三角格局，添加到结果列表
		if (p1ToP3Square && p2ToP3Square) {
			tSquares.push({
				points: [planet1Name, planet2Name, planet3Name],
				oppositionPoints: [planet1Name, planet2Name],
				apexPoint: planet3Name,
			});
		}

		// 检查p1和p3是否形成对冲相位
		const p1ToP3Opposition = planet1Data.aspects?.some(
			aspect => aspect.to === planet3Name && aspect.type === "Opposition"
		);

		// 如果p1和p3形成对冲相位，检查p2是否与p1和p3都形成刑相位
		if (p1ToP3Opposition) {
			const p1ToP2Square = planet1Data.aspects?.some(aspect => aspect.to === planet2Name && aspect.type === "Square");
			const p3ToP2Square = planet3Data.aspects?.some(aspect => aspect.to === planet2Name && aspect.type === "Square");

			if (p1ToP2Square && p3ToP2Square) {
				tSquares.push({
					points: [planet1Name, planet3Name, planet2Name],
					oppositionPoints: [planet1Name, planet3Name],
					apexPoint: planet2Name,
				});
			}
		}

		// 检查p2和p3是否形成对冲相位
		const p2ToP3Opposition = planet2Data.aspects?.some(
			aspect => aspect.to === planet3Name && aspect.type === "Opposition"
		);

		// 如果p2和p3形成对冲相位，检查p1是否与p2和p3都形成刑相位
		if (p2ToP3Opposition) {
			const p2ToP1Square = planet2Data.aspects?.some(aspect => aspect.to === planet1Name && aspect.type === "Square");
			const p3ToP1Square = planet3Data.aspects?.some(aspect => aspect.to === planet1Name && aspect.type === "Square");

			if (p2ToP1Square && p3ToP1Square) {
				tSquares.push({
					points: [planet2Name, planet3Name, planet1Name],
					oppositionPoints: [planet2Name, planet3Name],
					apexPoint: planet1Name,
				});
			}
		}
	}

	return tSquares;
};
