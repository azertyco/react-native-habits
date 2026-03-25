export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getWeekKey = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const diff =
    (date.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24);
  return `${date.getFullYear()}-W${Math.ceil(
    (diff + firstDay.getDay() + 1) / 7
  )}`;
};

export const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}`;
