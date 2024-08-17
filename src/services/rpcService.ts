import DiscordRPC from "discord-rpc";
import { config } from "../utils/config";
import getStatus from "../infrastructure/vlc";
import titleParser from "../utils/title_parser";
import * as ani from "../api/anilist";
import getAuthUrl from "../api/auth/auth_url";
import generateToken from "../api/auth/gen_token";

const rpc = new DiscordRPC.Client({ transport: "ipc" });
const clientId = config.discordClientId;

interface SavedInfo {
  title: string;
  episode: string | undefined;
}

const savedInfo: SavedInfo = {
  title: "",
  episode: "",
};

let updateAni = true;
let prevState = "";

const getAniImage = async (title: string) => {
  try {
    const response = await ani.aniImage(title);
    return {
      largeImageKey: response.coverImage.large,
      largeImageText: response.title.romaji,
    };
  } catch (error) {
    try {
      const response = await ani.userData();
      return {
        largeImageKey: response.avatar.large,
      };
    } catch (error) {
      console.error("Error retrieving AniList image?", error);
      return {};
    }
  }
};

const buildActivity = (vlcStatus: any, parsedTitle: any, aniImage: any) => {
  const stateCapitalized =
    vlcStatus.state.charAt(0).toUpperCase() + vlcStatus.state.slice(1);

  const activity: any = {
    details: aniImage.largeImageText || parsedTitle.title,
    state: stateCapitalized,
    instance: true,
    largeImageKey:
      aniImage.largeImageKey ||
      "https://pbs.twimg.com/media/GCSoXH4acAAQWWP.png",
    largeImageText: aniImage.largeImageText || parsedTitle.title,
  };

  if (parsedTitle.episode) {
    activity.state += ` - Episode ${parsedTitle.episode}`;
  }

  if (vlcStatus.state === "playing") {
    const startTimestamp = Math.round(Date.now() / 1000 - vlcStatus.time);
    activity.startTimestamp = startTimestamp;
  }

  return { activity, stateCapitalized };
};

const updateAniList = async (vlcStatus: any, parsedTitle: any) => {
  if (vlcStatus.length - vlcStatus.time < 300 && updateAni) {
    console.log("Attempting to update AniList...");
    try {
      await ani.anilistUpdate(parsedTitle.title, Number(parsedTitle.episode));
    } catch (error) {
      console.error("Error updating AniList", error);
    }
    updateAni = false;
  }
};

const setStatus = async () => {
  const vlcStatus = await getStatus();
  if (vlcStatus === null) {
    console.log("Error retrieving VLC status");
    rpc.clearActivity();
    return;
  }

  const parsedTitle = titleParser(vlcStatus.title);

  if (
    savedInfo.title !== parsedTitle.title ||
    savedInfo.episode !== parsedTitle.episode
  ) {
    savedInfo.title = parsedTitle.title;
    savedInfo.episode = parsedTitle.episode;
    updateAni = true;
  }

  const aniImage = await getAniImage(parsedTitle.title);
  const { activity, stateCapitalized } = buildActivity(
    vlcStatus,
    parsedTitle,
    aniImage
  );

  if (stateCapitalized !== prevState) {
    console.log(
      `${stateCapitalized} \"${parsedTitle.title}\" - Episode ${parsedTitle.episode}`
    );
    prevState = stateCapitalized;
  }

  await rpc.setActivity(activity);
  await updateAniList(vlcStatus, parsedTitle);
};

rpc.on("ready", () => {
  console.log("Logged in as", rpc.user?.username);
  if (!config.anilistAuth) {
    getAuthUrl();
  }
  if (!config.anilistToken) {
    generateToken();
  }
  setStatus();
  setInterval(setStatus, 15e3);
});

rpc.login({ clientId });
