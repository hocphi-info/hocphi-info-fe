#!/usr/bin/env node
// make blog-dev: xem trước bài (kể cả nháp) khi đang viết.
// Chạy build lần đầu, theo dõi content/bai-viet và sinh lại posts.json mỗi khi file
// đổi (Next tự nạp lại module), đồng thời chạy `next dev` như tiến trình con.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { formatIssues, runBuild } from "./build.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const contentDir = path.join(root, "content", "bai-viet");
const opts = { root, drafts: true, og: false, links: false };

async function rebuild(reason) {
  const { issues, stats } = await runBuild(opts);
  const errors = issues.filter((i) => i.level === "error").length;
  console.log(
    `\n[blog] ${reason}: ${stats.included} bài (${stats.drafts} nháp), ${errors} lỗi`,
  );
  if (issues.length > 0) console.log(formatIssues(issues));
}

await rebuild("build lần đầu");

let timer;
let running = false;
let again = false;
fs.watch(contentDir, { recursive: true }, (_event, file) => {
  if (!file || file.endsWith(".DS_Store")) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    if (running) {
      again = true;
      return;
    }
    running = true;
    do {
      again = false;
      await rebuild(`đổi ${file}`);
    } while (again);
    running = false;
  }, 300);
});

const next = spawn("npx", ["next", "dev"], { stdio: "inherit", cwd: root });
const stop = () => next.kill("SIGINT");
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
next.on("exit", (code) => process.exit(code ?? 0));
