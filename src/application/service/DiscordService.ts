import { DiscordAPI } from "../../infrastructure/api/DiscordAPI";

export class DiscordService {
  private discordAPI: DiscordAPI;

  constructor() {
    this.discordAPI = new DiscordAPI();
  }
}
