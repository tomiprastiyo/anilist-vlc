import axios from "axios";
import { config } from "../../infrastructure/config/dotenvConfig";
import opn from "opn";
import { injectable } from "inversify";

const authEndpoint = "https://anilist.co/api/v2/oauth/authorize";
const tokenEndpoint = "https://anilist.co/api/v2/oauth/token";
const responseType = "code";

@injectable()
export class AniListAuthService {
  public async initiateAuth(): Promise<void> {
    if (!config.anilistAuth) {
      try {
        const completeUrl = `${authEndpoint}?client_id=${config.anilistClientId}&redirect_uri=${config.anilistRedirect}&response_type=${responseType}`;

        await opn(completeUrl);
        console.log(`Opened authentication URL: ${completeUrl}`);
      } catch (error) {
        console.error("Failed to open authentication URL:", error);
      }
    } else {
      console.log("AniList auth is already set.");
    }
  }

  public async getAniListToken(): Promise<void> {
    if (config.anilistAuth && !config.anilistToken) {
      const requestOptions = {
        method: "POST",
        url: tokenEndpoint,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          grant_type: "authorization_code",
          client_id: config.anilistClientId,
          client_secret: config.anilistClientSecret,
          redirect_uri: config.anilistRedirect,
          code: config.anilistAuth,
        },
      };

      try {
        const response = await axios(requestOptions);

        if (response.status === 200) {
          const token = response.data.access_token;
          console.log(`AniList token: ${token}`);
        } else {
          console.error(`Failed to get AniList token: ${response.statusText}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            `Failed to get AniList token: ${error.response?.statusText}`
          );
        } else {
          console.error("Failed to get AniList token:", error);
        }
      }
    } else {
      console.log("AniList token is already set.");
    }
  }
}
