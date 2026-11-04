/** ¿Es temporada navideña? Noviembre, Diciembre y hasta mediados de Enero. */
export function isChristmasSeason(date: Date = new Date()): boolean {
  const month = date.getMonth(); // 0 = enero, 10 = noviembre, 11 = diciembre
  const day = date.getDate();
  return month === 10 || month === 11 || (month === 0 && day <= 15);
}
