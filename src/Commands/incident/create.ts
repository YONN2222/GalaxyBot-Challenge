import {
    ChatInputCommandInteraction,
    LabelBuilder,
    MessageFlags,
    ModalBuilder,
    SlashCommandSubcommandBuilder,
    type ModalSubmitInteraction, TextDisplayBuilder, ContainerBuilder, TextInputStyle, TextInputBuilder
} from "discord.js";
import { Incident } from "../../Database/Models/Incident";
import { Config } from "../../Database/Models/Config";
import { GuildCheck, PermissionCheck, ConfigCheck } from "../../Utils/Checks";

export const data = new SlashCommandSubcommandBuilder()
    .setName("create")
    .setDescription("Create an incident");

export async function execute(interaction: ChatInputCommandInteraction) {
    // guild check
    if (!await GuildCheck(interaction)) return;

    // permission check
    if (!await PermissionCheck(interaction)) return;

    // get config
    const config = await Config.findOne({ where: { guildId: interaction.guildId! } });

    // config check
    if (!await ConfigCheck(interaction, config)) return;

    // create modal
    const modal = new ModalBuilder()
        .setCustomId("create-incident-modal")
        .setTitle("Create Incident");

    const titleInput = new LabelBuilder()
        .setLabel("Title:")
        .setDescription("Enter the title of the incident.")
        .setTextInputComponent(
            new TextInputBuilder()
                .setCustomId("incident-title")
                .setPlaceholder("Incident Title")
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(100)
                .setStyle(TextInputStyle.Short)
        );

    const descriptionInput = new LabelBuilder()
        .setLabel("Description:")
        .setDescription("Enter a description of the incident.")
        .setTextInputComponent(
            new TextInputBuilder()
                .setCustomId("incident-description")
                .setPlaceholder("Incident Description")
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(1000)
                .setStyle(TextInputStyle.Paragraph)
        );

    modal.addLabelComponents(titleInput, descriptionInput);

    await interaction.showModal(modal);
}