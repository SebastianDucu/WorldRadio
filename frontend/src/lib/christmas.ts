/** ¿Es temporada navideña? Del 1 de diciembre al 6 de enero (según la fecha del dispositivo). */
export function isChristmasSeason(date: Date = new Date()): boolean {
  const month = date.getMonth(); // 0 = enero
  const day = date.getDate();
  return month === 11 || (month === 0 && day <= 6);
}
