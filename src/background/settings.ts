import { deepAssign } from "./utils";
import { backends } from "./backends";
import { BackendSettings, Settings } from "./types";

const defaultSettings: Settings = {
  targetLanguage: "en", // supported by all backends
  currentBackend: backends.keys().next().value!,
  backendSettings: Object.fromEntries(
    Array.from(backends.entries()).map(([key, backend]) => [
      key,
      backend.metadata.configSpecs.reduce(
        (settings, configSpec) => {
          settings[configSpec.key] = configSpec.defaultValue;
          return settings;
        },
        <BackendSettings>{},
      ),
    ]),
  ),
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
