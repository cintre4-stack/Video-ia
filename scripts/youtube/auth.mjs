// One-time OAuth to get a YouTube refresh token. Run it on your own computer (it opens a
// browser sign-in and listens on localhost for the redirect).
//
//   YT_CLIENT_ID=... YT_CLIENT_SECRET=... node scripts/youtube/auth.mjs [--save]
//
// The client must be a Google Cloud OAuth client of type "Desktop app" with the
// YouTube Data API v3 enabled. --save appends YT_REFRESH_TOKEN to .env (gitignored).
import { appendFileSync } from "node:fs";
import { createServer } from "node:http";
import { loadDotEnv } from "./lib.mjs";

loadDotEnv();
const { YT_CLIENT_ID, YT_CLIENT_SECRET } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET) {
  console.error("Set YT_CLIENT_ID and YT_CLIENT_SECRET (env or .env) first.");
  process.exit(1);
}

const server = createServer();
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const redirect = `http://127.0.0.1:${server.address().port}`;

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.search = new URLSearchParams({
  client_id: YT_CLIENT_ID,
  redirect_uri: redirect,
  response_type: "code",
  scope: "https://www.googleapis.com/auth/youtube.upload",
  access_type: "offline",
  prompt: "consent",
}).toString();
console.log(
  `Open this URL and sign in with the channel's account:\n\n${authUrl}\n`,
);

const code = await new Promise((resolve, reject) => {
  server.on("request", (req, res) => {
    const params = new URL(req.url, redirect).searchParams;
    res.end(
      params.get("code")
        ? "Done. You can close this tab."
        : "Authorization failed.",
    );
    params.get("code")
      ? resolve(params.get("code"))
      : reject(new Error(params.get("error") ?? "no code"));
  });
});
server.close();

const res = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    client_id: YT_CLIENT_ID,
    client_secret: YT_CLIENT_SECRET,
    redirect_uri: redirect,
    grant_type: "authorization_code",
  }),
});
const json = await res.json();
if (!json.refresh_token)
  throw new Error(`no refresh token: ${JSON.stringify(json)}`);

if (process.argv.includes("--save")) {
  appendFileSync(".env", `\nYT_REFRESH_TOKEN=${json.refresh_token}\n`);
  console.log("Saved YT_REFRESH_TOKEN to .env");
} else {
  console.log(
    "Refresh token obtained. Re-run with --save to store it in .env (gitignored).",
  );
}
