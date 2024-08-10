import { config } from "../../infrastructure/config/dotenvConfig";
import opn from "opn";

const baseUrl = "https://anilist.co/api/v2/oauth/authorize";
const responseType = "code";

export class AniListAuthService {
  public static async initiateAuth() {
    if (!config.anilistAuth) {
      try {
        const completeUrl = `${baseUrl}?client_id=${config.anilistClientId}&redirect_uri=${config.anilistRedirect}&response_type=${responseType}`;

        await opn(completeUrl); // Gunakan opn untuk membuka URL
        console.log(`Opened authentication URL: ${completeUrl}`);
      } catch (error) {
        console.error(`Failed to open authentication URL: ${error}`);
      }
    } else {
      console.log("AniList token is already set.");
    }
  }
}
