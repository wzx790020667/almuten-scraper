/**
 * 格式化日期为宫神星网所需的格式
 * @param year 年份
 * @param month 月份 (1-12)
 * @param day 日期 (1-31)
 * @param hour 小时 (0-23)
 * @param minute 分钟 (0-59)
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): string {
  // 确保月份和日期是两位数
  const formattedMonth = month.toString().padStart(2, "0");
  const formattedDay = day.toString().padStart(2, "0");

  // 确保小时和分钟是两位数
  const formattedHour = hour.toString().padStart(2, "0");
  const formattedMinute = minute.toString().padStart(2, "0");

  return `${year}-${formattedMonth}-${formattedDay} ${formattedHour}:${formattedMinute}:00`;
}

/**
 * 验证日期是否有效
 * @param year 年份
 * @param month 月份 (1-12)
 * @param day 日期 (1-31)
 * @param hour 小时 (0-23)
 * @param minute 分钟 (0-59)
 * @returns 布尔值，表示日期是否有效
 */
export function validateDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): boolean {
  // 检查年份是否合理
  if (year < 1900 || year > new Date().getFullYear()) {
    return false;
  }

  // 检查月份是否在有效范围内
  if (month < 1 || month > 12) {
    return false;
  }

  // 根据月份检查日期是否有效
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  // 检查小时是否在有效范围内
  if (hour < 0 || hour > 23) {
    return false;
  }

  // 检查分钟是否在有效范围内
  if (minute < 0 || minute > 59) {
    return false;
  }

  return true;
}

/**
 * 格式化经纬度为网站所需格式
 * @param latitude 纬度
 * @param longitude 经度
 * @returns 格式化后的经纬度字符串
 */
export function formatCoordinates(latitude: number, longitude: number) {
  const latDirection = latitude >= 0 ? "N" : "S";
  const lonDirection = longitude >= 0 ? "E" : "W";

  const absLat = Math.abs(latitude);
  const absLon = Math.abs(longitude);
  const latDegrees = Math.floor(absLat);
  const latMinutes = Math.floor((absLat - latDegrees) * 60);

  const lonDegrees = Math.floor(absLon);
  const lonMinutes = Math.floor((absLon - lonDegrees) * 60);

  return {
    latDegrees,
    latDirection,
    latMinutes,
    lonDegrees,
    lonDirection,
    lonMinutes,
  };
}
