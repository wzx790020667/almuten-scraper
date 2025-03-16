import moment from "moment-timezone";

/**
 * TimezoneHelper 类 - 用于处理时区相关的计算和转换
 */
export class TimezoneHelper {
	// 缓存已计算过的经纬度对应的时区
	private static coordinateCache: Map<string, string> = new Map();

	// 时区偏移映射表
	private static readonly timezoneOffsetMap: { [key: string]: number } = {
		"Etc/GMT+12": -720, // GMT-12
		"Etc/GMT+11": -660, // GMT-11
		"Etc/GMT+10": -600, // GMT-10
		"Etc/GMT+9": -540, // GMT-9
		"Etc/GMT+8": -480, // GMT-8
		"Etc/GMT+7": -420, // GMT-7
		"Etc/GMT+6": -360, // GMT-6
		"Etc/GMT+5": -300, // GMT-5
		"Etc/GMT+4": -240, // GMT-4
		"Etc/GMT+3": -180, // GMT-3
		"Etc/GMT+2": -120, // GMT-2
		"Etc/GMT+1": -60, // GMT-1
		"Etc/GMT": 0, // GMT+0
		"Etc/GMT-1": 60, // GMT+1
		"Etc/GMT-2": 120, // GMT+2
		"Etc/GMT-3": 180, // GMT+3
		"Etc/GMT-4": 240, // GMT+4
		"Etc/GMT-5": 300, // GMT+5
		"Etc/GMT-6": 360, // GMT+6
		"Etc/GMT-7": 420, // GMT+7
		"Etc/GMT-8": 480, // GMT+8
		"Etc/GMT-9": 540, // GMT+9
		"Etc/GMT-10": 600, // GMT+10
		"Etc/GMT-11": 660, // GMT+11
		"Etc/GMT-12": 720, // GMT+12
	};

	/**
	 * 根据经纬度获取时区名称
	 * @param latitude 纬度 (-90 到 90)
	 * @param longitude 经度 (-180 到 180)
	 * @returns 时区名称
	 * @throws Error 当经纬度超出有效范围时
	 */
	public static getTimezoneByCoordinates(latitude: number, longitude: number): string {
		// 验证经纬度范围
		if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
			throw new Error("无效的经纬度值。纬度范围：-90到90，经度范围：-180到180。");
		}

		// 生成缓存键
		const cacheKey = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;

		// 检查缓存
		if (this.coordinateCache.has(cacheKey)) {
			return this.coordinateCache.get(cacheKey)!;
		}

		// 简化时区计算，直接根据经度范围映射
		const longitudeRanges = [
			{ min: -180, max: -172.5, timezone: "Etc/GMT+12" },
			{ min: -172.5, max: -157.5, timezone: "Etc/GMT+11" },
			{ min: -157.5, max: -142.5, timezone: "Etc/GMT+10" },
			{ min: -142.5, max: -127.5, timezone: "Etc/GMT+9" },
			{ min: -127.5, max: -112.5, timezone: "Etc/GMT+8" },
			{ min: -112.5, max: -97.5, timezone: "Etc/GMT+7" },
			{ min: -97.5, max: -82.5, timezone: "Etc/GMT+6" },
			{ min: -82.5, max: -67.5, timezone: "Etc/GMT+5" },
			{ min: -67.5, max: -52.5, timezone: "Etc/GMT+4" },
			{ min: -52.5, max: -37.5, timezone: "Etc/GMT+3" },
			{ min: -37.5, max: -22.5, timezone: "Etc/GMT+2" },
			{ min: -22.5, max: -7.5, timezone: "Etc/GMT+1" },
			{ min: -7.5, max: 7.5, timezone: "Etc/GMT" },
			{ min: 7.5, max: 22.5, timezone: "Etc/GMT-1" },
			{ min: 22.5, max: 37.5, timezone: "Etc/GMT-2" },
			{ min: 37.5, max: 52.5, timezone: "Etc/GMT-3" },
			{ min: 52.5, max: 67.5, timezone: "Etc/GMT-4" },
			{ min: 67.5, max: 82.5, timezone: "Etc/GMT-5" },
			{ min: 82.5, max: 97.5, timezone: "Etc/GMT-6" },
			{ min: 97.5, max: 112.5, timezone: "Etc/GMT-7" },
			{ min: 112.5, max: 127.5, timezone: "Etc/GMT-8" },
			{ min: 127.5, max: 142.5, timezone: "Etc/GMT-9" },
			{ min: 142.5, max: 157.5, timezone: "Etc/GMT-10" },
			{ min: 157.5, max: 172.5, timezone: "Etc/GMT-11" },
			{ min: 172.5, max: 180, timezone: "Etc/GMT-12" },
		];

		const timezone =
			longitudeRanges.find(range => longitude >= range.min && longitude < range.max)?.timezone || "Etc/GMT";

		// 存入缓存
		this.coordinateCache.set(cacheKey, timezone);
		return timezone;
	}

	/**
	 * 获取指定时区的偏移量（分钟）
	 * @param timezone 时区名称
	 * @param date 指定日期，默认为当前时间
	 * @returns 时区偏移量（分钟）
	 */
	public static getTimezoneOffset(timezone: string, date: Date = new Date()): number {
		return this.timezoneOffsetMap[timezone] || 0;
	}

	/**
	 * 根据经纬度获取时区偏移量（分钟）
	 * @param latitude 纬度
	 * @param longitude 经度
	 * @param date 指定日期，默认为当前时间
	 * @returns 时区偏移量（分钟）
	 */
	public static getTimezoneOffsetByCoordinates(latitude: number, longitude: number, date: Date = new Date()): number {
		const timezone = this.getTimezoneByCoordinates(latitude, longitude);
		return this.getTimezoneOffset(timezone, date);
	}
}
