import { StandaloneInstance } from "galactic.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFileExtension = path.extname(fileURLToPath(import.meta.url));
const instance = new StandaloneInstance(
    `${import.meta.dir}/bot${currentFileExtension}`,
    1,
    1,
    process.env.BOT_TOKEN!,
    [],
);

instance.start();

process.on("SIGTERM", () => instance.shutdown().then(() => process.exit(0)));
process.on("SIGINT", () => instance.shutdown().then(() => process.exit(0)));
