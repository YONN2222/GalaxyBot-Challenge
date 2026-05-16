import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export let commands: Command[] = [];

export async function loadCommands() {
    const loaded: Command[] = [];
    const currentFileExtension = path.extname(fileURLToPath(import.meta.url));

    for (const file of fs.readdirSync(import.meta.dir, { withFileTypes: true })) {
        if (!file.isFile()) continue;
        if (!file.name.endsWith(currentFileExtension)) continue;
        if (file.name === `index${currentFileExtension}`) continue;

        const filePath = path.join(import.meta.dir, file.name);
        const mod = await import(pathToFileURL(filePath).href);

        if ("data" in mod && "execute" in mod) {
            loaded.push({ data: mod.data, execute: mod.execute });
        }
    }

    commands = loaded;
}
