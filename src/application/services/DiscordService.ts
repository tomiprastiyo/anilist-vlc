import { injectable } from "inversify";
import { DiscordAPI } from "../../infrastructure/api/DiscordAPI";

@injectable()
export class DiscordService {
  constructor() {
    new DiscordAPI();
  }
}
