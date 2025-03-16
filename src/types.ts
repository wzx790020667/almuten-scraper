import type { Aspect } from "./settings/types";

/**
 * 出生信息接口
 */
export interface BirthInfo {
	/**
	 * 姓名
	 */
	name: string;
	/**
	 * 出生年份
	 */
	year: number;

	/**
	 * 出生月份 (1-12)
	 */
	month: number;

	/**
	 * 出生日期 (1-31)
	 */
	day: number;

	/**
	 * 出生小时 (0-23)
	 */
	hour: number;

	/**
	 * 出生分钟 (0-59)
	 */
	minute: number;

	/**
	 * 出生地点名称
	 */
	location: string;

	/**
	 * 纬度 (可选)
	 */
	latitude: number;

	/**
	 * 经度 (可选)
	 */
	longitude: number;
}

/**
 * 行星信息接口
 */
export interface PlanetInfo {
	/**
	 * 行星名称
	 */
	name: string;

	/**
	 * 星座位置
	 */
	sign: string;

	/**
	 * 度数
	 */
	degree: number;

	/**
	 * 宫位
	 */
	house?: number;

	/**
	 * 行星状态描述
	 */
	status?: string;
}

/**
 * 宫位信息接口
 */
export interface HouseInfo {
	/**
	 * 宫位编号
	 */
	number: number;

	/**
	 * 星座
	 */
	sign: string;

	/**
	 * 度数
	 */
	degree: number;

	/**
	 * 宫位主管星
	 */
	ruler?: string;
}

/**
 * 相位信息接口
 */
export interface AspectInfo {
	/**
	 * 第一个行星
	 */
	planet1: string;

	/**
	 * 第二个行星
	 */
	planet2: string;

	/**
	 * 相位类型
	 */
	type: string;

	/**
	 * 相位角度
	 */
	angle: number;

	/**
	 * 轨道
	 */
	orb?: number;
}

export interface HoroscopeData {
	/**
	 * 出生信息
	 */
	birthInfo: BirthInfo;

	/**
	 * 行星信息列表
	 */
	planets: PlanetInfo[];

	/**
	 * 宫位信息列表
	 */
	houses: HouseInfo[];

	/**
	 * 相位信息列表
	 */
	aspects: AspectInfo[];

	/**
	 * 上升星座
	 */
	ascendant?: PlanetInfo;

	/**
	 * 中天星座
	 */
	midheaven?: PlanetInfo;

	/**
	 * 其他星盘特殊点
	 */
	specialPoints?: PlanetInfo[];
}

export interface ScraperConfig {
	/**
	 * 爬虫选项
	 */
	birthInfo: BirthInfo;

	/**
	 * 爬虫选项
	 */
	options?: ScraperOptions;
}

export interface ScraperOptions {
	/**
	 * 等待时间（毫秒）
	 */
	timeout?: number;
	/**
	 * 是否使用传统占星术
	 */
	traditional?: boolean;
}
