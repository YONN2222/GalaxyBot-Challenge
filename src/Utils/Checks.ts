import {
    type ChatInputCommandInteraction,
    ContainerBuilder,
    GuildMember,
    MessageFlags,
    PermissionFlagsBits,
    TextDisplayBuilder
} from "discord.js";
import { Config } from "../Database/Models/Config";


export async function GuildCheck(interaction: ChatInputCommandInteraction): Promise<boolean> {
    if (!interaction.guildId) {
        const GuildTextComponent = new TextDisplayBuilder()
            .setContent("This command can only be used in a server.");
        const GuildContainer = new ContainerBuilder()
            .addTextDisplayComponents(GuildTextComponent)

        try {
            await interaction.reply({
                components: [GuildContainer],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (error) {
            console.error("Error:", error);
        }
        return false;
    }
    return true;
}

export async function ConfigPermissionCheck(interaction: ChatInputCommandInteraction): Promise<boolean> {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        const NoPermissionTextComponent = new TextDisplayBuilder()
            .setContent("You dont have Permission to use this command.");
        const NoPermissionContainer = new ContainerBuilder()
            .addTextDisplayComponents(NoPermissionTextComponent)

        try {
            await interaction.reply({
                components: [NoPermissionContainer],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error("Error:", error);
        }

        return false;
    }
    return true;
}

export async function ConfigCheck(interaction: ChatInputCommandInteraction, config: Config | null): Promise<boolean> {
    if (!config) {
        const NoConfigTextComponent = new TextDisplayBuilder()
            .setContent("This server dosent has a Config, create one with `/config`.");
        const NoConfigContainer = new ContainerBuilder()
            .addTextDisplayComponents(NoConfigTextComponent)

        try {
            await interaction.reply({
                components: [NoConfigContainer],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error("Error:", error);
        }

        return false;
    }
    return true;
}

export async function IncidentPermissionCheck(interaction: ChatInputCommandInteraction, config: Config): Promise<boolean> {
    if (!interaction.member || !(interaction.member instanceof GuildMember)) return false;
    const member = interaction.member;
    if (!member.roles.cache.has(config.roleId)) {
        const NoPermissionTextComponent = new TextDisplayBuilder()
            .setContent("You dont have Permission to use this command.");
        const NoPermissionContainer = new ContainerBuilder()
            .addTextDisplayComponents(NoPermissionTextComponent)
        try {
            await interaction.reply({
                components: [NoPermissionContainer],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error("Error:", error);
        }
        return false;
    }
    return true;

}