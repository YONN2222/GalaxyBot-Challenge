import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandSubcommandBuilder,
    TextDisplayBuilder,
    ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize,
} from "discord.js";
import { ConfigCheck, GuildCheck, IncidentPermissionCheck } from "../../Utils/Checks";
import { Incident } from "../../Database/Models/Incident";
import {Config} from "../../Database/Models/Config";

export const data = new SlashCommandSubcommandBuilder()
    .setName("close")
    .setDescription("Close an incident")
    .addIntegerOption(option =>
        option
            .setName("id")
            .setDescription("The ID of the incident to close")
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    // guild check
    if (!await GuildCheck(interaction)) return;

    // get config
    const config = await Config.findOne({ where: { guildId: interaction.guildId! } });

    // config check
    if (!await ConfigCheck(interaction, config)) return;

    // permission check
    if (!await IncidentPermissionCheck(interaction, config!)) return;

    const id = interaction.options.getInteger("id", true);
    if (!id) return;

    const incident = await Incident.findOne({ where: { id: id } });
    const channel = await interaction.guild?.channels.fetch(config!.channelId);
    if (!channel || !channel.isSendable()) {
        await interaction.reply({
            content: "Channel not found or not sendable.",
            flags: MessageFlags.Ephemeral,
        })
        return
    };

    if (!incident) {
        await interaction.reply({
            content: "Incident not found.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (incident.status === "closed") {
        await interaction.reply({
            content: "Incident is already closed.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    try {
        await incident.update({ status: "closed" });
        const message = await channel?.messages.fetch(incident.messageId);
        const IncidentContainer = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### #${incident.id} Resolved Incident\n## ${incident.title}`))
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(incident.description))
            .setAccentColor(0x57F287);

        await message?.edit({
            components: [IncidentContainer],
            flags: MessageFlags.IsComponentsV2
        });

        await interaction.reply({
            content: "Incident closed successfully.",
            flags: MessageFlags.Ephemeral,
        });
    } catch (error) {
        console.log("Error closing incident:", error);
        await interaction.reply({
            content: "An error occurred while closing the incident.",
            flags: MessageFlags.Ephemeral,
        });
    }
}