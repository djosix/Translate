import { deepAssign } from "./utils";
import { Settings } from "./types";

const defaultSettings: Settings = {
  translator: {
    backend: "google",
    language: "zh-hant", // supported by all backends
    backendSettings: {},
  },
  enableTooltip: true,
};

export function loadSettings() {
  return new Promise<Settings>((resolve) => {
    chrome.storage.sync.get("settings", (data: { settings?: Settings }) => {
      resolve(<Settings>deepAssign({}, defaultSettings, data.settings || {}));
    });
  });
}

export function saveSettings(settings: Settings) {
  chrome.storage.sync.set({ settings });
}
