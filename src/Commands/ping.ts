import {
  type ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!");

export async function execute(interaction: ChatInputCommandInteraction) {
  const TextComponent = new TextDisplayBuilder().setContent("## Pong!");
  const container = new ContainerBuilder().addTextDisplayComponents(TextComponent);

  try {
    await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
