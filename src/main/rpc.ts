import { DiscordService } from "../application/services/DiscordService";
import { AniListAuthService } from "../application/services/AniListService";

new DiscordService();
AniListAuthService.initiateAuth();
