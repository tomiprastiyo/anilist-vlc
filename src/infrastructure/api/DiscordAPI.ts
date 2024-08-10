import { Client } from "discord-rpc";
import { config } from "../config/dotenvConfig";

const client = new Client({ transport: "ipc" });

export class DiscordAPI {
  private rpcClient: Client;

  constructor() {
    this.rpcClient = client;
    this.initialize();
  }

  private async initialize() {
    this.rpcClient.on("ready", () => {
      console.log(`Logged in as ${this.rpcClient.user?.username}!`);
    });

    try {
      await this.rpcClient.login({ clientId: config.discordClientId });
    } catch (error) {
      console.error("Failed to login to Discord RPC:", error);
    }
  }
}
