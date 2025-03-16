export const CHAR_TO_PLANET = {
	Q: "Sun",
	W: "Moon",
	E: "Mercury",
	R: "Venus",
	T: "Mars",
	Y: "Jupiter",
	U: "Saturn",
	I: "Uranus",
	O: "Neptune",
	P: "Pluto",
	"‹": "North_Node",
	Z: "Ascendant",
	X: "Midheaven",
};

export const CHAR_TO_ASPECT = {
	w: "Opposition",
	q: "Conjunction",
	r: "Square",
	e: "Trine",
	t: "Sextile",
};

export const CHAR_TO_SIGN = {
	f: "Can",
	c: "Pis",
	h: "Vir",
	l: "Sag",
	z: "Cap",
	k: "Sco",
	j: "Lib",
	a: "Ari",
	d: "Gem",
	s: "Tau",
	x: "Aqu",
	g: "Leo",
};

export const SIGN_TO_RULERS = {
	Ari: ["Mars"],
	Tau: ["Venus"],
	Gem: ["Mercury"],
	Can: ["Moon"],
	Leo: ["Sun"],
	Vir: ["Mercury"],
	Lib: ["Venus"],
	Sco: ["Pluto", "Mars"],
	Sag: ["Jupiter"],
	Cap: ["Saturn"],
	Aqu: ["Uranus", "Saturn"],
	Pis: ["Neptune", "Jupiter"],
};
