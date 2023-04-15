import { Client, Events, GatewayIntentBits } from "discord.js";
import config from "./config.json.js";

// 1. Discord 봇용 클라이언트 인스턴스를 생성하고 Discord에 로그인
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(config.token);
