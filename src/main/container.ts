import { Container } from "inversify";
import { DiscordService } from "../application/services/DiscordService";
import { AniListAuthService } from "../application/services/AniListService";
import { TYPES } from "./types";

const container = new Container();

container.bind<DiscordService>(TYPES.DiscordService).to(DiscordService);
container
  .bind<AniListAuthService>(TYPES.AniListAuthService)
  .to(AniListAuthService);

export { container };
