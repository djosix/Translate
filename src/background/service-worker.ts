import { translate } from "./translate";
import { createCache } from "./cache";
import { loadSettings, saveSettings } from "./settings";
import { deepAssign } from "./utils";
import { Settings, Request } from "./types";
import { getBackendSpecs } from "./backends";

const cache = createCache(256);

async function translateWithCache(text: string, settings: Settings) {
  text = text.trim();
  const key = JSON.stringify([
    settings.currentBackend,
    settings.backendSettings[settings.currentBackend],
    settings.targetLanguage,
    text,
  ]);
  {
    const cached = cache.get(key);
    if (cached) {
      console.log("Cached:", { key, cached });
      return cached;
    }
  }
  const result = await translate(text, settings);
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
          translateWithCache(request.text, settings)
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
      case "backends":
        sendResponse({ backends: getBackendSpecs() });
        return false;
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
