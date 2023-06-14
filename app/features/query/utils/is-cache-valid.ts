export const isCacheValid = (timestamp: Date) => {
  const mins = diffMinutes(new Date(timestamp), new Date());
  const isValid = mins < SCHEMA_VALID_FOR_MINUTES;
  return isValid;
};

const SCHEMA_VALID_FOR_MINUTES = 30;

function diffMinutes(date2: Date, date1: Date) {
  let diff = (date2.getTime() - date1.getTime()) / 1000 / 60;
  return Math.abs(Math.round(diff));
}
