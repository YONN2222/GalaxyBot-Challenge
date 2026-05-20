import {
	type ChatInputCommandInteraction,
	ContainerBuilder,
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	type ModalSubmitInteraction,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandSubcommandBuilder,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { Appends } from "../../Database/Models/Appends";
import { Config } from "../../Database/Models/Config";
import { Incident } from "../../Database/Models/Incident";
import {
	ConfigCheck,
	GuildCheck,
	IncidentPermissionCheck,
} from "../../Utils/Checks";
import { formatDiscordTime } from "../../Utils/DiscordTimestamp";

export const data = new SlashCommandSubcommandBuilder()
	.setName("append")
	.setDescription("Add a message to an incident")
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

	// create modal
	const modal = new ModalBuilder()
		.setCustomId(`append-incident-modal:${id}`)
		.setTitle("Add Append to Incident");

	const appendText = new LabelBuilder()
		.setLabel("Message:")
		.setDescription("Enter the message to append to the incident.")
		.setTextInputComponent(
			new TextInputBuilder()
				.setCustomId("append-message")
				.setPlaceholder("Message to append")
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(1000)
				.setStyle(TextInputStyle.Paragraph),
		);

	modal.addLabelComponents(appendText);

	await interaction.showModal(modal);
}

export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
	if (!interaction.customId.startsWith("append-incident-modal")) return;

	if (!interaction.guildId) {
		await interaction.reply({
			components: [
				new ContainerBuilder().addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						"This command can only be used in a server.",
					),
				),
			],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
		return;
	}

	const appendMessage = interaction.fields.getTextInputValue("append-message");
	const idText = interaction.customId.split(":")[1];
	if (!idText) return;
	const id = Number.parseInt(idText, 10);
	if (!id) return;

	const incident = await Incident.findOne({ where: { id: id } });
	if (!incident) return;

	const previousAppends: Appends[] = await Appends.findAll({
		where: { incidentId: id },
		order: [["createdAt", "ASC"]],
	});

	let createdAppend: Appends;
	try {
		createdAppend = await Appends.create({
			incidentId: incident.id,
			text: appendMessage,
		});
	} catch (error) {
		console.error("Error creating append:", error);
		await interaction.reply({
			components: [
				new ContainerBuilder().addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						"There was an error adding the append to the incident.",
					),
				),
			],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
		return;
	}

	try {
		await incident.update({ status: "appended" });
	} catch (error) {
		console.error("Error updating incident status:", error);
	}

	const config = await Config.findOne({
		where: { guildId: interaction.guildId },
	});
	if (!config) return;

	const channel = await interaction.client.channels.fetch(config.channelId);
	if (!channel?.isSendable()) {
		await interaction.reply({
			components: [
				new ContainerBuilder().addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						"Channel not found or not sendable.",
					),
				),
			],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
		return;
	}

	try {
		if (!incident.messageId) return;
		const message = await channel.messages.fetch(incident.messageId);

		const container = new ContainerBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`### #${incident.id} Incident\n## ${incident.title}`,
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`[${formatDiscordTime(incident.createdAt)}] ${incident.description}`,
				),
			);

		for (const append of previousAppends) {
			container
				.addSeparatorComponents(
					new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`[${formatDiscordTime(append.createdAt)}] ${append.text}`,
					),
				);
		}

		container
			.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`[${formatDiscordTime(createdAppend.createdAt)}] ${appendMessage}`,
				),
			)
			.setAccentColor(0xf8312f);

		await message.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2,
		});
	} catch (error) {
		console.error("Error updating incident message:", error);
		await interaction.reply({
			components: [
				new ContainerBuilder().addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						"There was an error updating the incident message.",
					),
				),
			],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
		return;
	}

	await interaction.reply({
		components: [
			new ContainerBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						"Append added to incident successfully.",
					),
				)
				.setAccentColor(0x57f287),
		],
		flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
	});
}
