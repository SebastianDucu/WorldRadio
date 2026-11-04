export function isChristmasSeason(date: Date = new Date()): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  return month === 10 || month === 11 || (month === 0 && day <= 15);
}
