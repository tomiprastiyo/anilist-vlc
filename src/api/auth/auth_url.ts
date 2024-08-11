import opn from "opn";
import { config } from "../../utils/config";

const baseUrl: string = "https://anilist.co/api/v2/oauth/authorize";

const responseType: string = "code";

const getAuthUrl = async (): Promise<string> => {
  const authUrl: string = `${baseUrl}?client_id=${config.anilistClientId}&redirect_uri=${config.anilistRedirect}&response_type=${responseType}`;

  opn(authUrl);
  return authUrl;
};

export default getAuthUrl;
