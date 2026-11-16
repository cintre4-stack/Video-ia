// Builds a YouTube Shorts publish pack for one Remotion composition.
//
//   node scripts/youtube/build-pack.mjs <compositionId> [--skip-render] [--thumb-only]
//
// Reads publish/<compositionId>.json and writes out/youtube/<compositionId>/:
//   video.mp4        H.264/AAC render of the composition
//   thumbnail.jpg    still at metadata.thumbnailFrame (kept under 2 MB)
//   metadata.json    resolved metadata, ready for upload.mjs
//   description.txt  copy-paste description for YouTube Studio
//   pinned-comment.txt
// Set REMOTION_BROWSER_EXECUTABLE to use a local Chrome instead of Remotion's download.
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  PUBLISH_DIR,
  packDir,
  readJson,
  resolveDescription,
  validateMetadata,
} from "./lib.mjs";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const skipRender = args.includes("--skip-render");
const thumbOnly = args.includes("--thumb-only");
if (!id) {
  console.error(
    "Usage: node scripts/youtube/build-pack.mjs <compositionId> [--skip-render] [--thumb-only]",
  );
  process.exit(1);
}

const metaPath = join(PUBLISH_DIR, `${id}.json`);
if (!existsSync(metaPath)) {
  console.error(
    `Missing ${metaPath}. Copy publish/_template.json and fill it in.`,
  );
  process.exit(1);
}
const meta = readJson(metaPath);
if (meta.composition !== id) {
  console.error(
    `${metaPath} has composition "${meta.composition}", expected "${id}"`,
  );
  process.exit(1);
}

const { errors, warnings } = validateMetadata(meta);
warnings.forEach((w) => console.warn(`warn: ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`error: ${e}`));
  process.exit(1);
}

const dir = packDir(id);
mkdirSync(dir, { recursive: true });
const video = join(dir, "video.mp4");
const thumb = join(dir, "thumbnail.jpg");
// Optional: point Remotion at a local Chrome when its own download is blocked.
const browser = process.env.REMOTION_BROWSER_EXECUTABLE
  ? [`--browser-executable=${process.env.REMOTION_BROWSER_EXECUTABLE}`]
  : [];
const run = (cmd, argv) =>
  execFileSync(cmd, [...argv, ...browser], { stdio: "inherit" });

if (!skipRender && !thumbOnly) {
  run("npx", [
    "remotion",
    "render",
    id,
    video,
    "--codec=h264",
    "--crf=18",
    "--audio-codec=aac",
    "--audio-bitrate=192k",
  ]);
}

// Thumbnail: YouTube caps uploads at 2 MB, so step quality down until it fits.
for (const quality of [92, 85, 75, 65]) {
  run("npx", [
    "remotion",
    "still",
    id,
    thumb,
    `--frame=${meta.thumbnailFrame}`,
    "--image-format=jpeg",
    `--jpeg-quality=${quality}`,
  ]);
  if (statSync(thumb).size <= 2 * 1024 * 1024) break;
}

if (!thumbOnly) {
  if (!existsSync(video)) {
    console.error(`No ${video}; run without --skip-render first.`);
    process.exit(1);
  }
  const probe = JSON.parse(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        video,
      ],
      { encoding: "utf8" },
    ),
  );
  const v = probe.streams.find((s) => s.codec_type === "video");
  const hasAudio = probe.streams.some((s) => s.codec_type === "audio");
  const seconds = Number(probe.format.duration);
  const shortsOk = v.height >= v.width && seconds <= 180;
  console.log(
    `\nvideo: ${v.width}x${v.height}, ${seconds.toFixed(1)} s, audio: ${hasAudio ? "yes" : "NO"}`,
  );
  if (!shortsOk)
    console.warn(
      "warn: not a Short (needs vertical/square and at most 3 minutes)",
    );
  if (!hasAudio) console.warn("warn: video has no audio track");
}

const description = resolveDescription(meta);
const resolved = {
  ...meta,
  description,
  privacyStatus: meta.privacyStatus ?? "private",
  files: { video: "video.mp4", thumbnail: "thumbnail.jpg" },
  builtAt: new Date().toISOString(),
};
writeFileSync(
  join(dir, "metadata.json"),
  JSON.stringify(resolved, null, 2) + "\n",
);
writeFileSync(join(dir, "description.txt"), description + "\n");
if (meta.pinnedComment)
  writeFileSync(join(dir, "pinned-comment.txt"), meta.pinnedComment + "\n");

console.log(`\nPack ready in ${dir}/`);
console.log(`  title: ${meta.title}`);
console.log(
  `  privacy: ${resolved.privacyStatus}${meta.publishAt ? ` (publishAt ${meta.publishAt})` : ""}`,
);
console.log(`Upload with: node scripts/youtube/upload.mjs ${id} --dry-run`);
