import { DiscordRepository } from "../../domain/interfaces/DiscordRepository";
import { AniListRepository } from "../../domain/interfaces/AniListRepository";
import { VLCRepository } from "../../domain/interfaces/VLCRepository";
import { parseTitle } from "../../utils/titleParser";

export class DiscordService {
  private vlcRepo: VLCRepository;
  private aniListRepo: AniListRepository;
  private discordRepo: DiscordRepository;

  private savedInfo = { title: "", episode: "" };
  private prevState = "";
  private updateAni = true;

  constructor(
    vlcRepo: VLCRepository,
    aniListRepo: AniListRepository,
    discordRepo: DiscordRepository
  ) {
    this.vlcRepo = vlcRepo;
    this.aniListRepo = aniListRepo;
    this.discordRepo = discordRepo;
  }

  private async getAniImage(title: string) {
    try {
      const response = await this.aniListRepo.getAniImage(title);
      return {
        largeImageKey: response.largeImageKey,
        largeImageText: response.largeImageText,
      };
    } catch (error) {
      // Handle errors and fallback
      console.error("Error retrieving AniList image:", error);
      return {};
    }
  }

  private buildActivity(
    vlcStatus: any,
    parsedTitle: { title: string; episode: string },
    aniImage: any
  ) {
    const stateCapitalized =
      vlcStatus.state.charAt(0).toUpperCase() + vlcStatus.state.slice(1);

    const activity = {
      details: aniImage.largeImageText || parsedTitle.title,
      state: stateCapitalized,
      instance: true,
      largeImageKey:
        aniImage.largeImageKey ||
        "https://pbs.twimg.com/media/GCSoXH4acAAQWWP.png",
      largeImageText: aniImage.largeImageText || parsedTitle.title,
      endTimestamp: Date.now() / 1000 + vlcStatus.length,
    };

    if (parsedTitle.episode) {
      activity.state += ` - Episode ${parsedTitle.episode}`;
    }

    if (vlcStatus.state === "playing") {
      const timeRemaining = Math.round(
        Date.now() / 1000 + (vlcStatus.length - vlcStatus.time)
      );
      activity.endTimestamp = timeRemaining;
    }

    return { activity, stateCapitalized };
  }

  private async updateAniList(
    vlcStatus: any,
    parsedTitle: { title: string; episode: string }
  ) {
    if (vlcStatus.length - vlcStatus.time < 300 && this.updateAni) {
      console.info("Attempting to update AniList...");
      try {
        await this.aniListRepo.updateAniList(
          parsedTitle.title,
          Number(parsedTitle.episode)
        );
      } catch (error) {
        console.error(
          "An error occurred, is this Anime in your watching list?",
          error
        );
      }
      this.updateAni = false;
    }
  }

  public async setStatus() {
    try {
      const vlcStatus = await this.vlcRepo.getStatus();
      if (vlcStatus === null) {
        console.error("Error retrieving VLC status");
        await this.discordRepo.clearActivity();
        return;
      }

      const parsedTitle = parseTitle(vlcStatus.title);

      if (
        this.savedInfo.title !== parsedTitle.title ||
        this.savedInfo.episode !== parsedTitle.episode
      ) {
        this.savedInfo.title = parsedTitle.title;
        this.savedInfo.episode = parsedTitle.episode;
        this.updateAni = true;
      }

      const aniImage = await this.getAniImage(parsedTitle.title);
      const { activity, stateCapitalized } = this.buildActivity(
        vlcStatus,
        parsedTitle,
        aniImage
      );

      if (stateCapitalized !== this.prevState) {
        console.info(
          `${stateCapitalized} "${parsedTitle.title}" - Episode ${parsedTitle.episode}`
        );
        this.prevState = stateCapitalized;
      }

      await this.discordRepo.setActivity(activity);
      await this.updateAniList(vlcStatus, parsedTitle);
    } catch (error) {
      console.error("Error in setStatus:", error);
    }
  }
}
