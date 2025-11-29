export interface Aspect {
	to: string;
	type: string;
	orb: string;
}

export interface CelestialBody {
	name: string;
	type: string;
	sign: string;
	pos: number;
	house: number;
	aspects: Aspect[];
	score: number;
	is_retrograde: boolean;
	is_ruler: true; // 是否为命主星
}

export interface House {
	number: number;
	sign: string;
	is_intercepted: boolean;
	rulers: CelestialBody[];
	occupants: CelestialBody[];
	flying_to: House;
}

/**
 * 星盘数据接口
 */
export interface Planet {
	sign: string | null;
	house: number | string | null;
	pos: number | string | null;
	score: number | string | null;
	aspects: Aspect[];
	// Analysis fields
	abs_degree?: number;
	sign_idx?: number;
	final_house?: number;
	is_moved_by_5_deg?: boolean;
	is_intercepted?: boolean;
	geometric_house?: number;
}

/**
 * 格局数据接口定义
 */
export interface GrandTrine {
	points: string[];
}

export interface Kite {
	points: string[];
	vertex: string;
	oppositionPoint: string;
}

export interface GrandCross {
	points: string[];
	oppositionPairs: string[][];
}

export interface Stellium {
	type: "sign" | "house";
	location: string;
	points: string[];
	count: number;
	dominateLocation?: string;
}

export interface TSquare {
	points: string[];
	oppositionPoints: string[];
	apexPoint: string;
}
