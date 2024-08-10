import axios from "axios";
import convert from "xml-js";
import { VLCRepository } from "../../domain/interfaces/VLCRepository";
import { config } from "../config/dotenvConfig"; // Pastikan path konfigurasi sesuai

const getXMLString = async () => {
  const baseUrl = `http://localhost:${config.vlcPort}/requests/status.xml`;

  try {
    const response = await axios.get(baseUrl, {
      auth: {
        username: "",
        password: config.vlcPassword,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching XML:", error);
    return null;
  }
};

const convertXML = (xmlString: string) => {
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
};

const getTitle = (xmlObject: any) => {
  const metaData = xmlObject.information.category[0];
  if (metaData.info.length === undefined) {
    return metaData.info._text;
  }

  const attributes = metaData.info.map(
    (element: any) => element._attributes.name
  );
  const names = metaData.info.map((element: any) => element._text);

  const titleIndex =
    attributes.indexOf("filename") || attributes.indexOf("title");
  return titleIndex !== -1 ? names[titleIndex] : "";
};

export class VLCRepositoryImpl implements VLCRepository {
  async getStatus() {
    try {
      const xmlString = await getXMLString();
      if (!xmlString) return null;

      const xmlObject = JSON.parse(convertXML(xmlString)).root;

      return {
        title: getTitle(xmlObject),
        length: xmlObject.length._text,
        time: xmlObject.time._text,
        state: xmlObject.state._text,
      };
    } catch (error) {
      console.error("Error getting status:", error);
      return null;
    }
  }
}
