import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { SubCommand } from "./SubCommandBuilder";

export interface Command {
  data: SlashCommandBuilder;
  execute?: (interaction: ChatInputCommandInteraction) => Promise<void>;
  subCommands: Map<string, SubCommand>;
}

export let commands: Command[] = [];

export async function loadCommands() {
  const loaded: Command[] = [];
  const currentFileExtension = path.extname(fileURLToPath(import.meta.url));
  const commandsDir = path.join(import.meta.dir, "..", "Commands");

  for (const file of fs.readdirSync(commandsDir, { withFileTypes: true })) {
    if (!file.isFile()) continue;
    if (!file.name.endsWith(currentFileExtension)) continue;

    const filePath = path.join(commandsDir, file.name);
    const mod = await import(pathToFileURL(filePath).href);

    if (!("data" in mod)) continue;

    loaded.push({
      data: mod.data,
      execute: "execute" in mod ? mod.execute : undefined,
      subCommands: new Map<string, SubCommand>(),
    });
  }

  commands = loaded;
}
