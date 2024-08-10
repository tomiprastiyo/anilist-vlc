import { DiscordAPI } from "../../infrastructure/api/DiscordAPI";

export class DiscordService {
  constructor() {
    new DiscordAPI();
  }
}
