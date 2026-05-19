import { Client, type ClientOptions, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { Cluster } from "galactic.ts";
import { db } from "./Database/DatabaseManager";
import { handleModalSubmit } from "./Interactions/ModalHandler";
import { commands, loadCommands } from "./Utils/CommandBuilder";
import { loadSubCommands } from "./Utils/SubCommandBuilder";

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
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  },
  cluster,
);

cluster.client = client;

client.once(Events.ClientReady, async () => {
  // database
  try {
    await db.init();
  } catch (error) {
    console.error("Error initializing database:", error);
  }

  // load commands
  await loadCommands();
  await loadSubCommands(commands);
  const slashCommands = commands.map((cmd) => cmd.data.toJSON());
  const totalLoadedCommands = commands.reduce(
    (total, command) => total + 1 + command.subCommands.size,
    0,
  );
  await client.application?.commands.set(slashCommands);

  console.log(
    `Ready as ${client.user?.tag}, Cluster ${cluster.clusterID}, ${totalLoadedCommands} commands loaded`,
  );
});

// interaction handler
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isModalSubmit()) {
    await handleModalSubmit(interaction);
    return;
  }
  if (!interaction.isCommand()) return;

  const command = commands.find((cmd) => cmd.data.name === interaction.commandName);
  if (!command) {
    await interaction.reply({
      content: "Unknown Command ",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    if (interaction.isChatInputCommand()) {
      const subCommandName = interaction.options.getSubcommand(false);
      const subCommand = subCommandName ? command.subCommands.get(subCommandName) : undefined;

      if (subCommand) {
        await subCommand.execute(interaction);
      } else if (command.execute) {
        await command.execute(interaction);
      } else {
        await interaction.reply({
          content: "This command requires a subcommand.",
          flags: MessageFlags.Ephemeral,
        });
      }
    } else {
      await interaction.reply({
        content: "This command is not available.",
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "There was an error, so yeah be sad.",
      flags: MessageFlags.Ephemeral,
    });
  }
});

cluster.onSelfDestruct = async () => {
  await client.destroy();
};

client
  .login(cluster.token)
  .then(() => console.log("Logged in successfully!"))
  .catch((err) => console.error("Error while logging in:", err));
