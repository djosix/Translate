import { createTranslator } from "./translator";
import { createCache } from "./cache";
import { loadSettings, saveSettings } from "./settings";
import { deepAssign } from "./utils";
import { TranslatorSettings, Request } from "./types";

const translator = createTranslator();
const cache = createCache(256);

async function cachedTranslate(text: string, settings: TranslatorSettings) {
  text = text.trim();
  const key = JSON.stringify([
    settings.backend,
    settings.backendSettings[settings.backend],
    settings.language,
    text,
  ]);
  {
    const cached = cache.get(key);
    if (cached) {
      console.log("Cached:", { key, cached });
      return cached;
    }
  }
  const result = await translator.translate(text, settings);
  if (result !== null) {
    cache.set(key, result);
    console.log("Translated:", { key, result });
  }
  return result;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Service worker installed");
});

chrome.runtime.onMessage.addListener(
  (request: Request, sender, sendResponse) => {
    console.log("Received:", { request, sender });

    switch (request.action) {
      case "translate": {
        loadSettings().then((settings) => {
          cachedTranslate(request.text, settings.translator)
            .then((result) => {
              sendResponse({ result });
            })
            .catch((error) => {
              console.error("Failed to translate:", error);
              sendResponse({
                error:
                  typeof error === "string" ? error : JSON.stringify(error),
              });
            });
        });
        return true;
      }
      case "backends": {
        sendResponse({ backends: translator.getBackends() });
        return false;
      }
      case "settings": {
        const shouldUpdate =
          typeof request.settings === "object" &&
          Object.keys(request.settings).length > 0;
        loadSettings().then((settings) => {
          if (shouldUpdate) {
            deepAssign(settings, request.settings);
            saveSettings(settings);
          }
          sendResponse({ settings });
        });
        return true;
      }
      default: {
          return false;
      }
    }
  },
);
