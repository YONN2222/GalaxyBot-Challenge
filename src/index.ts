import { StandaloneInstance } from "galactic.ts";

const instance = new StandaloneInstance(
    `${import.meta.dir}/bot.ts`,
    1,
    1,
    process.env.BOT_TOKEN!,
    [],
);

instance.start();

process.on("SIGTERM", () => instance.shutdown().then(() => process.exit(0)));
process.on("SIGINT", () => instance.shutdown().then(() => process.exit(0)));