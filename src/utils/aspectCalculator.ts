import { get, set } from "lodash";
import { PLANETS } from "../settings/constants";

/**
 * 计算行星相位的双向关系
 * @param planets 行星数据
 */
export const calculateBidirectionalAspects = (planets: typeof PLANETS) => {
	// 遍历所有行星
	for (const [fromPlanet, planetData] of Object.entries(planets)) {
		// 检查行星是否有相位数据
		if (!planetData.aspects) continue;

		// 遍历当前行星的所有相位
		for (const aspect of planetData.aspects) {
			const toPlanet = aspect.to;
			const toPlanetData = get(planets, toPlanet);

			// 如果目标行星不存在，跳过
			if (!toPlanetData) continue;

			// 初始化目标行星的aspects数组（如果不存在）
			if (!toPlanetData.aspects) {
				set(planets, [toPlanet, "aspects"], []);
			}

			// 检查目标行星是否已经有了这个相位关系
			const hasReverse = toPlanetData.aspects.some(
				(reverseAspect: { to: string; type: string }) =>
					reverseAspect.to === fromPlanet && reverseAspect.type === aspect.type
			);

			// 如果没有反向相位，添加一个
			if (!hasReverse) {
				// 创建反向相位，注意轨道方向需要反转（A -> S, S -> A）
				const [orb, direction] = aspect.orb.split(" ");
				const reverseDirection = direction === "A" ? "S" : "A";

				toPlanetData.aspects.push({
					to: fromPlanet,
					type: aspect.type,
					orb: `${orb} ${reverseDirection}`,
				});
			}
		}
	}
};
