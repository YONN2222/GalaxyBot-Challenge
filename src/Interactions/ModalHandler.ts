import type { ModalSubmitInteraction } from "discord.js";
import { handleModalSubmit as handleConfigModalSubmit } from "../Commands/config";
import { handleModalSubmit as handleCreateIncidentModalSubmit } from "../Commands/incident/create";

export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
    if (interaction.customId === "config-modal") {
        await handleConfigModalSubmit(interaction);
    }
    if (interaction.customId === "create-incident-modal") {
        await handleCreateIncidentModalSubmit(interaction);
    }
}
