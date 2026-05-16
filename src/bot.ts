import { Client, GatewayIntentBits, MessageFlags } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('clientReady', async () => {
    console.log(`Bot is ready as ${client.user?.tag}!`)
})

client.login(process.env.BOT_TOKEN)