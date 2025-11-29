import { CHAR_TO_SIGN } from "../settings/mappingTable";

// Sign order for calculation
// Sign order for calculation
export const SIGN_ORDER = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

/**
 * Normalizes a degree string (e.g., "25°30") to a float (25.5).
 */
export const normalizeDegree = (degreeStr: string): number => {
  if (!degreeStr) return 0;
  // Handle format "25°30" or just "25"
  const parts = degreeStr.split("°");
  const degrees = parseFloat(parts[0]);
  const minutes = parts.length > 1 ? parseFloat(parts[1]) : 0;
  return degrees + minutes / 60;
};

/**
 * Converts sign index and relative degree to absolute longitude (0-360).
 */
export const getAbsoluteLongitude = (signIndex: number, degree: number): number => {
  return signIndex * 30 + degree;
};

/**
 * Gets the sign index from a sign string (e.g., "Ari" -> 0).
 */
export const getSignIndex = (sign: string): number => {
  return SIGN_ORDER.indexOf(sign);
};

export interface InterceptedChain {
  container_house_idx: number;
  intercepted_sign_idx: number;
  house_span_degrees: number;
}

export interface InterceptionResult {
  interceptedChains: InterceptedChain[];
  interceptedSigns: Set<number>; // For fast lookup
}

/**
 * Calculates intercepted signs and their container houses.
 * @param houseCusps Array of house cusps with sign and degree.
 *                   Expects 12 houses, 1-indexed keys in input object usually, but here we take array.
 *                   If input is object, convert to array first.
 */
export const calculateInterceptions = (
  houseCusps: { houseNum: number; sign: string; degree: number }[]
): InterceptionResult => {
  const interceptedChains: InterceptedChain[] = [];
  const interceptedSigns = new Set<number>();

  // Sort by house number to ensure order 1-12
  const sortedCusps = [...houseCusps].sort((a, b) => a.houseNum - b.houseNum);

  // Identify missing signs
  const presentSigns = new Set(sortedCusps.map((c) => getSignIndex(c.sign)));
  const missingSigns: number[] = [];
  for (let i = 0; i < 12; i++) {
    if (!presentSigns.has(i)) {
      missingSigns.push(i);
    }
  }

  // For each missing sign, find the container house
  for (const missingSignIdx of missingSigns) {
    // A house contains a sign if the house starts before the sign and ends after the sign.
    // In a circular 360 system, this means the house span covers the entire 30 degrees of the sign.
    
    // Check each house to see if it contains the missing sign
    for (let i = 0; i < 12; i++) {
      const currentCusp = sortedCusps[i];
      const nextCusp = sortedCusps[(i + 1) % 12];

      const currentSignIdx = getSignIndex(currentCusp.sign);
      const nextSignIdx = getSignIndex(nextCusp.sign);
      
      const currentAbs = getAbsoluteLongitude(currentSignIdx, currentCusp.degree);
      let nextAbs = getAbsoluteLongitude(nextSignIdx, nextCusp.degree);

      // Handle wrap around 360
      if (nextAbs < currentAbs) {
        nextAbs += 360;
      }

      const signStart = missingSignIdx * 30;
      const signEnd = (missingSignIdx + 1) * 30;

      // Adjust sign boundaries for wrap around comparison if necessary
      // If the house wraps around 360 (e.g. starts 350, ends 20), and we look for sign 0 (0-30).
      // currentAbs = 350, nextAbs = 380. signStart = 0, signEnd = 30.
      // We need to check if [signStart, signEnd] is within [currentAbs, nextAbs].
      // Since we normalized nextAbs to be > currentAbs, we should also normalize signStart/End if they are "after" 360 relative to currentAbs?
      // Actually, easier logic:
      // A sign is intercepted if the house cusp absolute longitude is "before" the sign start
      // AND the next house cusp absolute longitude is "after" the sign end.
      
      // Let's use the normalized nextAbs.
      // If we have a wrap around case for the house (current > next originally), 
      // we might need to treat the sign as potentially wrapped too?
      // No, simply: check if the interval [currentAbs, nextAbs] fully contains [signStart, signEnd]
      // OR [signStart+360, signEnd+360] (if the house wraps).
      
      let isContained = false;
      
      // Case 1: Normal check
      if (currentAbs <= signStart && nextAbs >= signEnd) {
        isContained = true;
      }
      // Case 2: House wraps, check if sign is in the wrapped part (e.g. house 350-380, sign 0-30 -> 360-390)
      else if (currentAbs <= signStart + 360 && nextAbs >= signEnd + 360) {
        isContained = true;
      }

      if (isContained) {
        interceptedChains.push({
          container_house_idx: currentCusp.houseNum,
          intercepted_sign_idx: missingSignIdx,
          house_span_degrees: nextAbs - currentAbs,
        });
        interceptedSigns.add(missingSignIdx);
        break; // Found the container for this missing sign
      }
    }
  }

  return { interceptedChains, interceptedSigns };
};

export interface PlanetAnalysisResult {
  name: string;
  abs_degree: number;
  sign_idx: number;
  final_house: number;
  is_moved_by_5_deg: boolean;
  is_intercepted: boolean;
  geometric_house: number;
}

/**
 * Calculates planet placement with 5-degree rule (configurable) and interception check.
 */
export const calculatePlanetPlacement = (
  planetName: string,
  planetSign: string,
  planetDegree: number,
  houseCusps: { houseNum: number; sign: string; degree: number }[],
  interceptedSigns: Set<number>,
  orb: number = 5.0 // Default to 5 degrees
): PlanetAnalysisResult => {
  const signIdx = getSignIndex(planetSign);
  const absDegree = getAbsoluteLongitude(signIdx, planetDegree);
  
  // 1. Determine Geometric House
  let geometricHouse = -1;
  const sortedCusps = [...houseCusps].sort((a, b) => a.houseNum - b.houseNum);
  
  for (let i = 0; i < 12; i++) {
    const currentCusp = sortedCusps[i];
    const nextCusp = sortedCusps[(i + 1) % 12];
    
    const currentSignIdx = getSignIndex(currentCusp.sign);
    const nextSignIdx = getSignIndex(nextCusp.sign);
    
    const currentAbs = getAbsoluteLongitude(currentSignIdx, currentCusp.degree);
    let nextAbs = getAbsoluteLongitude(nextSignIdx, nextCusp.degree);
    
    if (nextAbs < currentAbs) {
      nextAbs += 360;
    }
    
    let pAbs = absDegree;
    // If house wraps, and planet is in the low range (e.g. 10), treat as 370 for comparison
    if (pAbs < currentAbs && (pAbs + 360) < nextAbs) {
        pAbs += 360;
    }
    
    if (pAbs >= currentAbs && pAbs < nextAbs) {
      geometricHouse = currentCusp.houseNum;
      break;
    }
  }
  
  // Fallback if not found (should not happen with correct logic)
  if (geometricHouse === -1) {
      // Edge case logic or default
      console.warn(`Could not determine geometric house for ${planetName} at ${absDegree}`);
      geometricHouse = 1; // Default
  }

  // 2. 5-Degree Rule
  let finalHouse = geometricHouse;
  let isMoved = false;
  
  // Find the cusp of the NEXT house
  // If geometric house is 1, next is 2. If 12, next is 1.
  const nextHouseNum = (geometricHouse % 12) + 1;
  const nextCuspObj = sortedCusps.find(c => c.houseNum === nextHouseNum)!;
  const nextCuspSignIdx = getSignIndex(nextCuspObj.sign);
  const nextCuspAbs = getAbsoluteLongitude(nextCuspSignIdx, nextCuspObj.degree);
  
  // Calculate distance to next cusp
  // Distance = (Next_Cusp - Planet) % 360
  // We need to handle the wrap around carefully.
  // The planet is "before" the next cusp.
  let distance = nextCuspAbs - absDegree;
  if (distance < 0) distance += 360;
  
  if (distance <= orb) {
    finalHouse = nextHouseNum;
    isMoved = true;
  }

  // 3. Interception Status
  // Determined by SIGN location only
  const isIntercepted = interceptedSigns.has(signIdx);

  return {
    name: planetName,
    abs_degree: absDegree,
    sign_idx: signIdx,
    final_house: finalHouse,
    is_moved_by_5_deg: isMoved,
    is_intercepted: isIntercepted,
    geometric_house: geometricHouse,
  };
};
