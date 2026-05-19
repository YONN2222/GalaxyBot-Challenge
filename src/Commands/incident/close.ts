import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandSubcommandBuilder,
    TextDisplayBuilder,
    ContainerBuilder,
} from "discord.js";

export const data = new SlashCommandSubcommandBuilder()
    .setName("close")
    .setDescription("Close an incident");

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) {
        const GuildTextComponent = new TextDisplayBuilder()
            .setContent("This command can only be used in a server.");
        const GuildContainer = new ContainerBuilder()
            .addTextDisplayComponents(GuildTextComponent)

        try {
            await interaction.reply({
                components: [GuildContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error("Error:", error);
        }

        return;
    }
}