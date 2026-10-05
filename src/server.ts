import { spawn } from "child_process";
import fs from "fs";
import path from "path";

function loadEnvFile(): void {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...values] = trimmed.split("=");
        if (key && values.length > 0) {
          const val = values.join("=").trim().replace(/^['"](.*)['"]$/, "$1");
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    });
  }
}

loadEnvFile();

const port = process.env.APP_PORT || "3000";
const mode = process.argv[2] === "start" ? "start" : "dev";
const isWindows = process.platform === "win32";
const nextCmd = isWindows ? "next.cmd" : "next";
const npxCmd = isWindows ? "npx.cmd" : "npx";

console.log(`Starting Next.js in ${mode} mode on port ${port}...`);

const child = spawn(npxCmd, ["next", mode, "-p", port], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PORT: port,
  },
});

child.on("error", (err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

