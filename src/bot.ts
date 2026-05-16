import { Cluster } from "galactic.ts";
import { Client, GatewayIntentBits, type ClientOptions } from "discord.js";

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

client.once("clientReady", () => {
    console.log(`Ready as ${client.user?.tag}, Cluster ${cluster.clusterID}`);
});

cluster.onSelfDestruct = async () => {
    await client.destroy();
};

client.login(cluster.token)
    .then(() => console.log("Logged in successfully!"))
    .catch(err => console.error("Error while logging in:", err));