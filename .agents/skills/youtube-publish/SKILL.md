---
name: youtube-publish
description: Turn a finished Remotion reel in this repo into a YouTube Shorts publish pack (rendered MP4, thumbnail still, Spanish title/description/tags/pinned comment) and optionally upload it with the YouTube Data API. Use when the user wants to publish, upload, schedule or prepare a reel for YouTube or YouTube Shorts, or write its YouTube title, description, hashtags or thumbnail.
---

# YouTube publish pack

Each reel is a composition in `src/Root.tsx` (1080x1920, 30 fps). Publishing one has three steps:
metadata → pack → upload. Never upload unless the user asked for it in this conversation.

## 1. Metadata: `publish/<compositionId>.json`

Start from `publish/_template.json` if the file does not exist. Write it from the reel's script in
`guiones/` so facts (dates, scorers, minutes, results) match what the narrator says.

- **title** (max 100 chars): hook + key moment, emoji at most one, ends with `#Shorts`. Spanish (Spain), same
  voice as the narration. The first ~40 chars carry it on mobile.
- **description**: array of lines. Line 1 is the hook (shown above "más"); then context with date and
  result; then the CTA question the reel ends with; then the AI disclosure line; last line 3–5 hashtags
  (`#Shorts` first, never more than 15).
- **tags**: 10–15, mix player/team/competition/year plus channel-wide tags; total under 500 chars.
- **categoryId** `"17"` (Sports). **defaultLanguage/defaultAudioLanguage** `"es"`.
- **madeForKids** `false`. **containsSyntheticMedia** `true`: the voice is AI and the match is a
  recreation, which YouTube's altered-content policy requires disclosing.
- **privacyStatus** `"private"` by default. To schedule, keep `"private"` and set **publishAt** (ISO date).
- **thumbnailFrame**: the most readable frame, usually just after the key goal when the scoreboard,
  big caption and celebrating players are all on screen. Check candidates before choosing:
  `npx remotion still <id> /tmp/x.jpg --frame=<n> --image-format=jpeg --scale=0.4`.
  Scene start = sum of earlier `SCENE_FRAMES` minus `T` per transition (see the reel's `timeline.ts`).
- **pinnedComment**: the API cannot pin, so it goes in the pack for the user to pin in Studio.

## 2. Pack: `npm run yt:pack -- <compositionId>`

Validates the metadata against YouTube limits, renders `video.mp4` (H.264, CRF 18, AAC 192k), renders
`thumbnail.jpg` (kept under 2 MB), checks with ffprobe that it qualifies as a Short (vertical, ≤ 3 min,
has audio) and writes everything to `out/youtube/<compositionId>/` (gitignored).

- `--thumb-only` re-renders only the thumbnail and metadata; `--skip-render` reuses an existing MP4.
- If Remotion cannot download its browser (cloud sessions), set
  `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
  (or whatever `ls /opt/pw-browsers` shows).
- Look at the thumbnail before calling the pack done. Report the duration and any warnings.

## 3. Upload: `npm run yt:upload -- <compositionId>`

Always run with `--dry-run` first and show the user the request body. A real upload needs explicit
confirmation, because it publishes to their channel.

Credentials (env or `.env`, never committed): `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`.
One-time setup the user does on their own computer:
1. Google Cloud console → enable **YouTube Data API v3** → OAuth client of type **Desktop app**.
2. Put the client id/secret in `.env`, then `npm run yt:auth -- --save` and sign in with the channel.

The script refreshes a token, does a resumable upload with snippet + status, sets the thumbnail, and
writes `upload.json` (video id, `youtube.com/shorts/<id>` URL). It refuses to upload a pack twice
unless given `--force`. `--privacy unlisted|public` overrides the file.

Things to tell the user when relevant:
- Projects that have not passed Google's API audit get every upload locked to **private**; they can
  publish it by hand in Studio or request the audit.
- Custom thumbnails need a phone-verified channel; the Shorts feed may still pick its own frame.
- Each upload costs ~1,600 of the default 10,000 daily quota units.

## Checklist before saying "ready"

- [ ] Facts in title/description match the guion and the reel.
- [ ] `yt:pack` passed with no errors; warnings explained.
- [ ] Thumbnail viewed and readable at small size.
- [ ] Dry run shown; real upload only after the user confirms.
