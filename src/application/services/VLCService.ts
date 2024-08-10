import axios from "axios";
import convert from "xml-js";
import { config } from "../../infrastructure/config/dotenvConfig";

class VLCService {
  private static async getXMLString(): Promise<string | null> {
    const baseUrl = `http://localhost:${config.vlcPort}/requests/status.xml`;

    try {
      const response = await axios.get(baseUrl, {
        auth: {
          username: "", // Add VLC username if needed
          password: config.vlcPassword,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to get VLC status:", error);
      return null;
    }
  }

  private static convertXML(xmlString: string): string {
    const options = {
      compact: true,
      spaces: 4,
      trim: true,
      ignoreDeclaration: true,
      ignoreInstruction: true,
      ignoreComment: true,
      ignoreCdata: true,
      ignoreDoctype: true,
    };

    return convert.xml2json(xmlString, options);
  }

  private static getTitle(xmlObject: any): string {
    const metaData = xmlObject.information.category[0];
    if (!metaData.info.length) {
      return metaData.info._text;
    }

    const attributes = metaData.info.map(
      (element: any) => element._attributes.name
    );
    const names = metaData.info.map((element: any) => element._text);

    const titleIndex =
      attributes.indexOf("filename") || attributes.indexOf("title");
    return titleIndex !== -1 ? names[titleIndex] : "";
  }

  public static async getStatus(): Promise<{
    title: string;
    length: string;
    time: string;
    state: string;
  } | null> {
    try {
      const xmlString = await this.getXMLString();
      if (!xmlString) return null;

      const xmlObject = JSON.parse(this.convertXML(xmlString)).root;

      const status = {
        title: this.getTitle(xmlObject),
        length: xmlObject.length._text,
        time: xmlObject.time._text,
        state: xmlObject.state._text,
      };

      return status;
    } catch (error) {
      console.error("Failed to get VLC status:", error);
      return null;
    }
  }
}

export default VLCService;
