import type { ModalSubmitInteraction } from "discord.js";
import { handleModalSubmit as handleConfigModalSubmit } from "../Commands/config";

export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
    if (interaction.customId === "config-modal") {
        await handleConfigModalSubmit(interaction);
    }
}
