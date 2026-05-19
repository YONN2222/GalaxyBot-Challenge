import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { ChatInputCommandInteraction, SlashCommandSubcommandBuilder } from "discord.js";
import type { Command } from "./CommandBuilder";

export interface SubCommand {
  data: SlashCommandSubcommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export async function loadSubCommands(commands: Command[]) {
  const extension = path.extname(fileURLToPath(import.meta.url));
  const commandsPath = path.join(import.meta.dir, "..", "Commands");

  for (const command of commands) {
    const subCommandsPath = path.join(commandsPath, command.data.name);

    if (!fs.existsSync(subCommandsPath) || !fs.statSync(subCommandsPath).isDirectory()) continue;

    for (const file of fs.readdirSync(subCommandsPath, { withFileTypes: true })) {
      if (!file.isFile() || !file.name.endsWith(extension)) continue;

      const modulePath = path.join(subCommandsPath, file.name);
      const mod = await import(pathToFileURL(modulePath).href);

      if (!("data" in mod) || !("execute" in mod)) continue;

      const subCommand = {
        data: mod.data as SlashCommandSubcommandBuilder,
        execute: mod.execute as SubCommand["execute"],
      };

      command.data.addSubcommand(subCommand.data);
      command.subCommands.set(subCommand.data.name, subCommand);
    }
  }
}
