// Uploads a built pack to YouTube with the Data API v3 (resumable upload + thumbnail).
//
//   node scripts/youtube/upload.mjs <compositionId> [--dry-run] [--privacy private|unlisted|public]
//
// Credentials come from the environment or .env (gitignored):
//   YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN   (get the token with scripts/youtube/auth.mjs)
// Writes out/youtube/<compositionId>/upload.json with the video id and URL.
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadDotEnv, packDir, readJson, validateMetadata } from "./lib.mjs";

const args = process.argv.slice(2);
const id = args.find(
  (a) => !a.startsWith("--") && !["private", "unlisted", "public"].includes(a),
);
const dryRun = args.includes("--dry-run");
const privacyArg = args.includes("--privacy")
  ? args[args.indexOf("--privacy") + 1]
  : undefined;
if (!id) {
  console.error(
    "Usage: node scripts/youtube/upload.mjs <compositionId> [--dry-run] [--privacy private|unlisted|public]",
  );
  process.exit(1);
}

const dir = packDir(id);
const metaPath = join(dir, "metadata.json");
if (!existsSync(metaPath)) {
  console.error(
    `No pack at ${dir}. Run: node scripts/youtube/build-pack.mjs ${id}`,
  );
  process.exit(1);
}
const meta = readJson(metaPath);
if (privacyArg) meta.privacyStatus = privacyArg;
const { errors } = validateMetadata(meta);
if (errors.length) {
  errors.forEach((e) => console.error(`error: ${e}`));
  process.exit(1);
}

const videoPath = join(dir, meta.files.video);
const thumbPath = join(dir, meta.files.thumbnail);
const uploadLog = join(dir, "upload.json");
if (existsSync(uploadLog) && !args.includes("--force")) {
  console.error(
    `Already uploaded (${uploadLog}). Pass --force to upload a second copy.`,
  );
  process.exit(1);
}

const body = {
  snippet: {
    title: meta.title,
    description: meta.description,
    tags: meta.tags ?? [],
    categoryId: meta.categoryId ?? "17",
    defaultLanguage: meta.defaultLanguage,
    defaultAudioLanguage: meta.defaultAudioLanguage,
  },
  status: {
    privacyStatus: meta.privacyStatus,
    selfDeclaredMadeForKids: meta.madeForKids,
    containsSyntheticMedia: meta.containsSyntheticMedia,
    embeddable: true,
    license: "youtube",
    ...(meta.publishAt
      ? { publishAt: new Date(meta.publishAt).toISOString() }
      : {}),
  },
};

if (dryRun) {
  console.log(JSON.stringify(body, null, 2));
  console.log(
    `\nvideo: ${videoPath} (${(statSync(videoPath).size / 1e6).toFixed(1)} MB)`,
  );
  console.log(
    `thumbnail: ${thumbPath} (${(statSync(thumbPath).size / 1e3).toFixed(0)} KB)`,
  );
  console.log("\nDry run: nothing uploaded.");
  process.exit(0);
}

loadDotEnv();
const { YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) {
  console.error(
    "Set YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN (see scripts/youtube/auth.mjs).",
  );
  process.exit(1);
}

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: YT_CLIENT_ID,
    client_secret: YT_CLIENT_SECRET,
    refresh_token: YT_REFRESH_TOKEN,
    grant_type: "refresh_token",
  }),
});
if (!tokenRes.ok)
  throw new Error(
    `token refresh failed: ${tokenRes.status} ${await tokenRes.text()}`,
  );
const { access_token } = await tokenRes.json();
const auth = { Authorization: `Bearer ${access_token}` };

// 1. Start a resumable session with the metadata.
const videoBytes = readFileSync(videoPath);
const init = await fetch(
  "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
  {
    method: "POST",
    headers: {
      ...auth,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": "video/mp4",
      "X-Upload-Content-Length": String(videoBytes.length),
    },
    body: JSON.stringify(body),
  },
);
if (!init.ok)
  throw new Error(`upload init failed: ${init.status} ${await init.text()}`);
const location = init.headers.get("location");

// 2. Send the bytes (reels are small, so one request).
const put = await fetch(location, {
  method: "PUT",
  headers: {
    ...auth,
    "Content-Type": "video/mp4",
    "Content-Length": String(videoBytes.length),
  },
  body: videoBytes,
});
if (!put.ok)
  throw new Error(`upload failed: ${put.status} ${await put.text()}`);
const video = await put.json();
const url = `https://youtube.com/shorts/${video.id}`;
console.log(`Uploaded: ${url} (${video.status?.privacyStatus})`);

// 3. Custom thumbnail. Needs a verified channel; Shorts feed may still pick a frame itself.
let thumbnail = "set";
const thumbRes = await fetch(
  `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${video.id}`,
  {
    method: "POST",
    headers: { ...auth, "Content-Type": "image/jpeg" },
    body: readFileSync(thumbPath),
  },
);
if (!thumbRes.ok) {
  thumbnail = `failed: ${thumbRes.status}`;
  console.warn(
    `warn: thumbnail not set (${thumbRes.status}). Channel may need phone verification.`,
  );
}

writeFileSync(
  uploadLog,
  JSON.stringify(
    {
      videoId: video.id,
      url,
      privacyStatus: video.status?.privacyStatus,
      thumbnail,
      uploadedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);
if (meta.pinnedComment)
  console.log(
    `Pin this comment by hand in Studio: ${join(dir, "pinned-comment.txt")}`,
  );
