import * as RPC from "discord-rpc";
import { DiscordService } from "../application/services/DiscordService";
import { VLCRepositoryImpl } from "../infrastructure/repositories/VLCRepositoryImpl";
import { AniListRepositoryImpl } from "../infrastructure/repositories/AniListRepositoryImpl";
import { DiscordRepositoryImpl } from "../infrastructure/repositories/DiscordRepositoryImpl";
import { config } from "../infrastructure/config/dotenvConfig";

const clientId = config.discordClientId;

const rpc = new RPC.Client({ transport: "ipc" });

const vlcRepo = new VLCRepositoryImpl();
const aniListRepo = new AniListRepositoryImpl();
const discordRepo = new DiscordRepositoryImpl();
const discordService = new DiscordService(vlcRepo, aniListRepo, discordRepo);

rpc.on("ready", () => {
  console.info(`Logged in as ${rpc.user?.username}`);
  discordService.setStatus();
  setInterval(() => discordService.setStatus(), 15000);
});

rpc.login({ clientId }).catch(console.error);
