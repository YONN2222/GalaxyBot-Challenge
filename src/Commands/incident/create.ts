import {
    ChannelSelectMenuBuilder,
    ChannelType,
    ChatInputCommandInteraction,
    LabelBuilder,
    MessageFlags,
    ModalBuilder,
    RoleSelectMenuBuilder,
    SlashCommandSubcommandBuilder,
    type ModalSubmitInteraction, TextDisplayBuilder, ContainerBuilder,
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


}