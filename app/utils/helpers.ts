import { DateTime } from "luxon";

export function optimizeCloudinaryImage(url: string | null | undefined, width: number) {
  if (url?.includes("cloudinary")) {
    return url.replace("upload/", `upload/w_${width},f_auto/`);
  }
  return url;
}

export function getMetaTagProjects(): string {
  return "Ethereum, Solana, Osmosis, Flow, NEAR, Axelar, Thorchain, Optimism, Terra, Binance";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getObjectSizeAsString(obj: any) {
  let str = null;
  if (typeof obj === "string") {
    // If obj is a string, then use it
    str = obj;
  } else {
    // Else, make obj into a string
    str = JSON.stringify(obj);
  }
  // Get the length of the Uint8Array
  const bytes = new TextEncoder().encode(str).length;

  if (bytes < 1024) return bytes + "B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(0) + "KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(0) + "MB";
  else return (bytes / 1073741824).toFixed(0) + "GB";
}

//TODO: handle the strings that are not dates at domain/zod level
export function getDateTimeDurationAsString(start: string, end: string) {
  const e = DateTime.fromISO(end);
  const s = DateTime.fromISO(start);
  return e.diff(s).shiftTo("seconds").toFormat("s's");
}

export function isValidURL(str: string) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}

export function formatDateTimeAgo(date: Date): string {
  const diff = DateTime.fromJSDate(date).diffNow();

  // If the difference is less than 60 seconds, display the number of seconds ago
  if (Math.abs(diff.as("seconds")) < 60) {
    return formatDatePartsAgo("second", diff.as("seconds"));
  }

  // If the difference is less than 60 minutes, display the number of minutes ago
  if (Math.abs(diff.as("minutes")) < 60) {
    return formatDatePartsAgo("minute", diff.as("minutes"));
  }

  // If the difference is less than 24 hours, display the number of hours ago
  if (Math.abs(diff.as("hours")) < 24) {
    return formatDatePartsAgo("hour", diff.as("hours"));
  }

  // If the difference is less than 10 days, display the number of days ago
  if (Math.abs(diff.as("days")) < 10) {
    return formatDatePartsAgo("day", diff.as("days"));
  }

  return DateTime.fromJSDate(date).toFormat("yyyy-MM-dd");
}

type DatePart = "second" | "minute" | "hour" | "day";

function formatDatePartsAgo(datePart: DatePart, value: number) {
  const cleanValue = Math.round(Math.abs(value));
  return `${cleanValue} ${datePart}${cleanValue > 1 ? "s" : ""} ago`;
}

export function emailIsValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
