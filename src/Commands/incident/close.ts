import {
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandSubcommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import { Config } from "../../Database/Models/Config";
import { Incident } from "../../Database/Models/Incident";
import {
	ConfigCheck,
	GuildCheck,
	IncidentPermissionCheck,
} from "../../Utils/Checks";

export const data = new SlashCommandSubcommandBuilder()
	.setName("close")
	.setDescription("Close an incident")
	.addIntegerOption((option) =>
		option
			.setName("id")
			.setDescription("The ID of the incident to close")
			.setRequired(true),
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	// guild check
	if (!(await GuildCheck(interaction))) return;
	const guildId = interaction.guildId;
	if (!guildId) return;

	// get config
	const config = await Config.findOne({ where: { guildId } });

	// config check
	if (!(await ConfigCheck(interaction, config))) return;
	if (!config) return;

	// permission check
	if (!(await IncidentPermissionCheck(interaction, config))) return;

	const id = interaction.options.getInteger("id", true);
	if (!id) return;

	const incident = await Incident.findOne({ where: { id: id } });

	if (!incident) {
		await interaction.reply({
			components: [
				new ContainerBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent("Incident not found."),
					)
					.setAccentColor(0xed4245),
			],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
		return;
	}

	if (incident.status === "closed") {
		await interaction.reply({
			components: [
				new ContainerBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent("Incident is already closed."),
					)
					.setAccentColor(0xed4245),
			],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
		return;
	}

	const channel = await interaction.guild?.channels.fetch(config.channelId);
	if (!channel?.isSendable()) {
		await interaction.reply({
			components: [
				new ContainerBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							"Channel not found or not sendable.",
						),
					)
					.setAccentColor(0xed4245),
			],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
		return;
	}

	try {
		await incident.update({ status: "closed" });
		const message = await channel.messages.fetch(incident.messageId);
		const IncidentContainer = new ContainerBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`### #${incident.id} Resolved Incident\n## ${incident.title}`,
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(incident.description),
			)
			.setAccentColor(0x57f287);

		await message?.edit({
			components: [IncidentContainer],
			flags: MessageFlags.IsComponentsV2,
		});

		await interaction.reply({
			components: [
				new ContainerBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							"Incident closed successfully.",
						),
					)
					.setAccentColor(0x57f287),
			],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	} catch {
		await interaction.reply({
			components: [
				new ContainerBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							"An error occurred while closing the incident.",
						),
					)
					.setAccentColor(0xed4245),
			],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}
