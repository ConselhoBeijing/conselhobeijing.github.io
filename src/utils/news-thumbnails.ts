import { extractFirstImageUrl } from "./content-preview.ts";

type NewsThumbnailSource = {
  data?: {
    thumbnail?: string;
  };
  body?: string | null;
};

const INVALID_THUMBNAIL_PREFIXES = ["blob:", "data:"];

export function isUsableNewsThumbnail(thumbnail: string | undefined): thumbnail is string {
  if (typeof thumbnail !== "string") {
    return false;
  }

  const value = thumbnail.trim();

  if (value.length === 0) {
    return false;
  }

  const normalized = value.toLowerCase();
  return !INVALID_THUMBNAIL_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function resolveNewsThumbnail(entry: NewsThumbnailSource): string | undefined {
  if (isUsableNewsThumbnail(entry.data?.thumbnail)) {
    return entry.data.thumbnail.trim();
  }

  const firstBodyImage = extractFirstImageUrl(entry.body ?? "");
  return isUsableNewsThumbnail(firstBodyImage) ? firstBodyImage.trim() : undefined;
}
