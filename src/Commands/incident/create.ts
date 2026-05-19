import {
    ChannelSelectMenuBuilder,
    ChannelType,
    ChatInputCommandInteraction,
    LabelBuilder,
    MessageFlags,
    ModalBuilder,
    RoleSelectMenuBuilder,
    SlashCommandSubcommandBuilder,
    type ModalSubmitInteraction, TextDisplayBuilder, ContainerBuilder, PermissionFlagsBits,
} from "discord.js";
import { Incident } from "../../Database/Models/Incident";
import { Config } from "../../Database/Models/Config";

export const data = new SlashCommandSubcommandBuilder()
    .setName("create")
    .setDescription("Create an incident");

export async function execute(interaction: ChatInputCommandInteraction) {
    // guild check
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

    // permission check
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        const NoPermissionTextComponent = new TextDisplayBuilder()
            .setContent("You dont have Permission to use this command.");
        const NoPermissionContainer = new ContainerBuilder()
            .addTextDisplayComponents(NoPermissionTextComponent)

        try {
            await interaction.reply({
                components: [NoPermissionContainer],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error("Error:", error);
        }

        return;
    }

    // get config
    const config = await Config.findOne({ where: { guildId: interaction.guildId } });

    // config check
    if (!config) {
        const NoConfigTextComponent = new TextDisplayBuilder()
            .setContent("This server dosent has a Config, create one with `/config`.");
        const NoConfigContainer = new ContainerBuilder()
            .addTextDisplayComponents(NoConfigTextComponent)

        try {
            await interaction.reply({
                components: [NoConfigContainer],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error("Error:", error);
        }

        return;
    }
}