import type { ImageVariantName, PreparedImageVariant } from "./media.types";

export function buildMediaStoragePath(input: { coupleId: string; memoryId: string; mediaId: string; variant: ImageVariantName; extension: string }) {
  const segment = [input.coupleId, input.memoryId, input.mediaId].every((value) => /^[0-9a-f-]{36}$/i.test(value));
  if (!segment || !/^[a-z0-9]+$/i.test(input.extension)) throw new Error("Invalid private media storage path.");
  return `couples/${input.coupleId}/memories/${input.memoryId}/${input.mediaId}/${input.variant}.${input.extension.toLowerCase()}`;
}

/** Never use originals in grids. Cards use medium, detail views use large, and lists use thumbnails. */
export function selectDisplayVariant(variants: PreparedImageVariant[], surface: "grid" | "card" | "detail") {
  const desired: ImageVariantName = surface === "grid" ? "thumbnail" : surface === "card" ? "medium" : "large";
  return variants.find((variant) => variant.name === desired) ?? variants.find((variant) => variant.name !== "original") ?? null;
}
