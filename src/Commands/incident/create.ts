import {
    ChatInputCommandInteraction,
    LabelBuilder,
    MessageFlags,
    ModalBuilder,
    SlashCommandSubcommandBuilder,
    type ModalSubmitInteraction, TextDisplayBuilder, ContainerBuilder, TextInputStyle, TextInputBuilder, ChannelType, SeparatorBuilder, SeparatorSpacingSize
} from "discord.js";
import { Incident } from "../../Database/Models/Incident";
import { Config } from "../../Database/Models/Config";
import {GuildCheck, ConfigCheck, IncidentPermissionCheck} from "../../Utils/Checks";

export const data = new SlashCommandSubcommandBuilder()
    .setName("create")
    .setDescription("Create an incident");

export async function execute(interaction: ChatInputCommandInteraction) {
    // guild check
    if (!await GuildCheck(interaction)) return;

    // get config
    const config = await Config.findOne({ where: { guildId: interaction.guildId! } });

    // config check
    if (!await ConfigCheck(interaction, config)) return;

    // permission check
    if (!await IncidentPermissionCheck(interaction, config!)) return;

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

export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== "create-incident-modal") return;

    if (!interaction.guildId) {
        await interaction.reply({
            components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("This command can only be used in a server.")).setAccentColor(0xED4245)],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
        return;
    }

    const title = interaction.fields.getTextInputValue("incident-title");
    const description = interaction.fields.getTextInputValue("incident-description");

    if (!title || !description) {
        await interaction.reply({
            components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("Please enter a Title and a Description.")).setAccentColor(0xED4245)],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
        return;
    }

    const config = await Config.findOne({ where: { guildId: interaction.guildId! } });
    if (!config) return
    const channel = await interaction.client.channels.fetch(config.channelId);
    if (!channel || !channel.isTextBased() || !channel.isSendable()) return;

    let incident;

    try {
        incident = await Incident.create({
            guildId: interaction.guildId,
            title: title,
            description: description,
            status: "open"
        })
    } catch (error) {
        console.log("Error creating incident:", error);
        await interaction.reply({
            components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("An error occurred while creating the incident.")).setAccentColor(0xED4245)],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
        return;
    }

    const IncidentContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### #${incident.id} New Incident\n## ${title}`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(description))
        .setAccentColor(0xF8312F)

    try {
        const message = await channel.send({
            components: [IncidentContainer],
            flags: MessageFlags.IsComponentsV2
        });

        await incident.update({ messageId: message.id });

        const SuccessfulCreteTextComponent = new TextDisplayBuilder()
            .setContent("Incident created successfully!");
        const SuccessfulCreateContainer = new ContainerBuilder()
            .addTextDisplayComponents(SuccessfulCreteTextComponent)
            .setAccentColor(0x57F287)

        await interaction.reply({
            components: [SuccessfulCreateContainer],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        })
    } catch (error) {
        console.error("Error:", error);
    }
}
