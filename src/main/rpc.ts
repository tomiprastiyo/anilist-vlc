import "reflect-metadata";
import { container } from "./container";
import { TYPES } from "./types";
import { DiscordService } from "../application/services/DiscordService";
import { AniListAuthService } from "../application/services/AniListService";

container.get<DiscordService>(TYPES.DiscordService);
const aniListAuthService = container.get<AniListAuthService>(
  TYPES.AniListAuthService
);

aniListAuthService.initiateAuth();
aniListAuthService.getAniListToken();
