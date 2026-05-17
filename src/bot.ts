import { Cluster } from "galactic.ts";
import { Client, GatewayIntentBits, type ClientOptions, MessageFlags } from "discord.js";
import { loadCommands, commands } from "./Utils/CommandBuilder";
import { db } from "./Database/DatabaseManager";

export class ExtendedClient extends Client {
    cluster: Cluster<ExtendedClient>;

    constructor(options: ClientOptions, cluster: Cluster<ExtendedClient>) {
        super(options);
        this.cluster = cluster;
    }
}

const cluster = Cluster.initial<ExtendedClient>();

const client = new ExtendedClient(
    {
        shards: cluster.shardList,
        shardCount: cluster.totalShards,
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    },
    cluster,
);

cluster.client = client;

client.once("clientReady", async () => {
    // database
    try {
        await db.init();
    } catch (error) {
        console.error("Error initializing database:", error);
    }

    // load commands
    await loadCommands();
    const slashCommands = commands.map((cmd) => cmd.data.toJSON());
    await client.application?.commands.set(slashCommands);

    console.log(`Ready as ${client.user?.tag}, Cluster ${cluster.clusterID}, ${commands.length} commands loaded`);
});

// command handler
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = commands.find(
        (cmd) => cmd.data.name === interaction.commandName
    );
    if (!command) {
        await interaction.reply({
            content: "Unknown Command ",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    try {
        if (interaction.isChatInputCommand()) {
            await command.execute(interaction);
        } else {
            await interaction.reply({
                content: "This command is not available.",
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (err) {
        console.error(err);
        await interaction.reply({
            content: "There was an error, so yeah be sad.",
            flags: MessageFlags.Ephemeral
        });
    }
});

cluster.onSelfDestruct = async () => {
    await client.destroy();
};

client.login(cluster.token)
    .then(() => console.log("Logged in successfully!"))
    .catch(err => console.error("Error while logging in:", err));
