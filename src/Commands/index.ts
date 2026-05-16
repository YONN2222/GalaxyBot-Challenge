import fs from "node:fs";
import path from "node:path";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export let commands: Command[] = [];

export async function loadCommands() {
    const loaded: Command[] = [];

    for (const file of fs.readdirSync(import.meta.dir, { withFileTypes: true })) {
        if (!file.isFile()) continue;
        if (!file.name.endsWith(".ts")) continue;
        if (file.name === "index.ts") continue;

        const filePath = path.join(import.meta.dir, file.name);
        const mod = await import(filePath);

        if ("data" in mod && "execute" in mod) {
            loaded.push({ data: mod.data, execute: mod.execute });
        }
    }

    commands = loaded;
}