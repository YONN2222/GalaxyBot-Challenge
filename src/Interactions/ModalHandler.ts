import type { ModalSubmitInteraction } from "discord.js";
import { handleModalSubmit as handleConfigModalSubmit } from "../Commands/config";
import { handleModalSubmit as handleAppendIncidentModalSubmit } from "../Commands/incident/append";
import { handleModalSubmit as handleCreateIncidentModalSubmit } from "../Commands/incident/create";

export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
	if (interaction.customId === "config-modal") {
		await handleConfigModalSubmit(interaction);
	}
	if (interaction.customId === "create-incident-modal") {
		await handleCreateIncidentModalSubmit(interaction);
	}
	if (interaction.customId.startsWith("append-incident-modal")) {
		await handleAppendIncidentModalSubmit(interaction);
	}
}
