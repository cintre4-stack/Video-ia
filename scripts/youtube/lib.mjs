// Shared helpers for the YouTube publish pack (see .agents/skills/youtube-publish/SKILL.md).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const PUBLISH_DIR = "publish";
export const PACK_ROOT = join("out", "youtube");

export const packDir = (id) => join(PACK_ROOT, id);

export const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

/** Loads KEY=value lines from .env (gitignored) without overriding real env vars. */
export const loadDotEnv = (path = ".env") => {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
};

/** Description may be a string or an array of lines; YouTube wants one string. */
export const resolveDescription = (meta) =>
  Array.isArray(meta.description)
    ? meta.description.join("\n")
    : meta.description;

/** YouTube counts a tag with spaces as if it were quoted. */
const tagCost = (t) => t.length + (t.includes(" ") ? 2 : 0);

/** Returns { errors, warnings } for a metadata file, using YouTube Data API limits. */
export const validateMetadata = (meta) => {
  const errors = [];
  const warnings = [];
  const description = resolveDescription(meta) ?? "";

  if (!meta.composition) errors.push("composition is required");
  if (!meta.title) errors.push("title is required");
  if (meta.title && [...meta.title].length > 100)
    errors.push(`title is ${[...meta.title].length} chars (max 100)`);
  if (/[<>]/.test(meta.title ?? "") || /[<>]/.test(description))
    errors.push("title/description cannot contain < or >");
  if (Buffer.byteLength(description, "utf8") > 5000)
    errors.push("description is over 5000 bytes");

  const tags = meta.tags ?? [];
  const tagTotal =
    tags.reduce((n, t) => n + tagCost(t), 0) + Math.max(0, tags.length - 1);
  if (tagTotal > 500) errors.push(`tags use ${tagTotal} chars (max 500)`);

  const privacy = meta.privacyStatus ?? "private";
  if (!["private", "unlisted", "public"].includes(privacy))
    errors.push(`bad privacyStatus "${privacy}"`);
  if (meta.publishAt && privacy !== "private")
    errors.push('publishAt needs privacyStatus "private"');
  if (meta.publishAt && Number.isNaN(Date.parse(meta.publishAt)))
    errors.push("publishAt is not an ISO date");
  if (meta.madeForKids === undefined)
    errors.push("madeForKids must be set (true/false)");
  if (meta.containsSyntheticMedia === undefined)
    errors.push(
      "containsSyntheticMedia must be set (altered/synthetic content disclosure)",
    );
  if (!Number.isInteger(meta.thumbnailFrame))
    errors.push("thumbnailFrame must be an integer frame");

  if (!/#shorts/i.test(`${meta.title} ${description}`))
    warnings.push("no #Shorts in title or description");
  if (description.length < 200)
    warnings.push("description is short; first 2 lines show above the fold");
  if ((description.match(/#\S+/g) ?? []).length > 15)
    warnings.push("more than 15 hashtags: YouTube ignores all of them");

  return { errors, warnings };
};
