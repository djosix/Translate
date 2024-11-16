import { Backend } from "./types";

const backend: Backend = {
  metadata: {
    name: "DeepL",
    configurable: [
      {
        name: "Auth Key",
        type: "password",
        key: "authKey",
        value: "",
      },
    ],
  },
  translate: async (text, targetLanguage, settings: { authKey: string }) => {
    // https://developers.deepl.com/docs/resources/supported-languages
    const future = fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${settings.authKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        target_lang: targetLanguage,
      }),
    });
    let response;
    try {
      response = await future;
    } catch (error) {
      throw `Failed to connect to DeepL: ${error}`;
    }
    if (!response.ok) {
      throw await response.text();
    }
    const data = await response.json();
    return data.translations[0].text;
  },

  languages: {
    Arabic: "AR",
    Bulgarian: "BG",
    Czech: "CS",
    Danish: "DA",
    German: "DE",
    Greek: "EL",
    English: "EN",
    "English (British)": "EN-GB",
    "English (American)": "EN-US",
    Spanish: "ES",
    Estonian: "ET",
    Finnish: "FI",
    French: "FR",
    Hungarian: "HU",
    Indonesian: "ID",
    Italian: "IT",
    Japanese: "JA",
    Korean: "KO",
    Lithuanian: "LT",
    Latvian: "LV",
    "Norwegian Bokmål": "NB",
    Dutch: "NL",
    Polish: "PL",
    Portuguese: "PT",
    "Portuguese (Brazilian)": "PT-BR",
    "Portuguese (variants)": "PT-PT",
    Romanian: "RO",
    Russian: "RU",
    Slovak: "SK",
    Slovenian: "SL",
    Swedish: "SV",
    Turkish: "TR",
    Ukrainian: "UK",
    Chinese: "ZH",
    "Chinese (simplified)": "ZH-HANS",
    "Chinese (traditional)": "ZH-HANT",
  },
};

export default backend;
