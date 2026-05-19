import {
    ChannelSelectMenuBuilder,
    ChannelType,
    ChatInputCommandInteraction,
    LabelBuilder,
    MessageFlags,
    ModalBuilder,
    RoleSelectMenuBuilder,
    SlashCommandBuilder,
    type ModalSubmitInteraction,
    TextDisplayBuilder,
    ContainerBuilder } from "discord.js";
import { Config } from "../Database/Models/Config";
import { GuildCheck, PermissionCheck } from "../Utils/Checks";

export const data = new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure the bot");

export async function execute(interaction: ChatInputCommandInteraction) {
    // guild check
    if (!await GuildCheck(interaction)) return;

    // permission check
    if (!await PermissionCheck(interaction)) return;


    const modal = new ModalBuilder()
        .setCustomId("config-modal")
        .setTitle("Configuration");

    const channelSelect = new LabelBuilder()
        .setLabel("Channel:")
        .setDescription("Select the channel where incidents will be reported.")
        .setChannelSelectMenuComponent(
            new ChannelSelectMenuBuilder()
                .setCustomId("incidents-channel")
                .setPlaceholder("Select a channel")
                .addChannelTypes(ChannelType.GuildText)
                .setMinValues(1)
                .setMaxValues(1)
                .setRequired(true),
        );

    const roleSelect = new LabelBuilder()
        .setLabel("Role:")
        .setDescription("Select the role that will have permissions to manage incidents.")
        .setRoleSelectMenuComponent(
            new RoleSelectMenuBuilder()
                .setCustomId("manage-incidents-role")
                .setPlaceholder("Select a role")
                .setMinValues(1)
                .setMaxValues(1)
                .setRequired(true),
        );

    modal.addLabelComponents(channelSelect, roleSelect);

    await interaction.showModal(modal);
}

export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== "config-modal") return;

    if (!interaction.guildId) {
        await interaction.reply({
            content: "This command can only be used in a server.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const roles = interaction.fields.getSelectedRoles("manage-incidents-role", true);
    const channels = interaction.fields.getSelectedChannels(
        "incidents-channel",
        true,
        [ChannelType.GuildText],
    );

    const role = roles.first();
    const channel = channels.first();

    if (!role || !channel) {
        await interaction.reply({
            content: "Please select a role and a channel.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    try {
        await Config.upsert({
            guildId: interaction.guildId,
            roleId: role.id,
            channelId: channel.id,
        })
    } catch (error) {
            console.log("Error saving configuration:", error);
             await interaction.reply({
                content: "An error occurred while saving the configuration.",
                flags: MessageFlags.Ephemeral,
            });
             return
        }


    const SuccessTextComponent = new TextDisplayBuilder()
        .setContent("Yay, Configuration saved.");
    const SuccessContainer = new ContainerBuilder()
        .addTextDisplayComponents(SuccessTextComponent)

    try {
        await interaction.reply({
            components: [SuccessContainer],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        });
    } catch (error) {
        console.error("Error:", error);
    }
}
