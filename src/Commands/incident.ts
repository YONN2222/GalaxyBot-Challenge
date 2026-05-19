import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("incident")
  .setDescription("Manage incidents");
