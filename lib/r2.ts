const DEFAULT_R2_TIME_ZONE = "Asia/Colombo";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

export function getR2Endpoint() {
  const value = getRequiredEnv("R2_ACCOUNT_ID");

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}.r2.cloudflarestorage.com`;
}

export function getR2PublicBaseUrl() {
  const value =
    process.env.R2_PUBLIC_URL?.trim() ||
    "https://pub-9f44a5b7fcfc49d9bfc9c9840bae1714.r2.dev";

  return value.replace(/\/+$/, "");
}

export function getR2TimeZone() {
  return process.env.R2_FOLDER_TIMEZONE?.trim() || DEFAULT_R2_TIME_ZONE;
}

export function getR2FolderDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: getR2TimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getR2ObjectKey(vehicleNumber: string, timestamp = Date.now()) {
  return `${getR2FolderDate()}/${vehicleNumber}-${timestamp}.webm`;
}

function parseFolderDate(folderName: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(folderName);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  return Date.UTC(Number(year), Number(month) - 1, Number(day));
}

export function getFolderAgeInDays(folderName: string, now = new Date()) {
  const folderTime = parseFolderDate(folderName);

  if (folderTime === null) {
    return null;
  }

  const currentFolderTime = parseFolderDate(getR2FolderDate(now));

  if (currentFolderTime === null) {
    return null;
  }

  return (currentFolderTime - folderTime) / (1000 * 60 * 60 * 24);
}
