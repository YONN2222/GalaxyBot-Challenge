import { StandaloneInstance } from "galactic.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { intents, shardsPerCluster, totalClusters } from "./instanceConfig";

if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN is not set in environment variables");

const currentFileExtension = path.extname(fileURLToPath(import.meta.url));
const botFilePath = path.join(import.meta.dir, `bot${currentFileExtension}`);

const instance = new StandaloneInstance(
    botFilePath,
    shardsPerCluster,
    totalClusters,
    process.env.BOT_TOKEN!,
    intents,
);

instance.start();

process.on("SIGTERM", () => instance.shutdown().then(() => process.exit(0)));
process.on("SIGINT", () => instance.shutdown().then(() => process.exit(0)));
