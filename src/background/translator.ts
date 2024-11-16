import google from "./backends/google";
import openai from "./backends/openai";
import deepl from "./backends/deepl";
import ollama from "./backends/ollama";
import { TranslatorSettings } from "./types";
import { Backend, BackendSettings } from "./backends/types";

export function createTranslator() {
  const backends = new Map<string, Backend>([
    ["google", google],
    ["openai", openai],
    ["deepl", deepl],
    ["ollama", ollama],
  ]);

  async function translate(text: string, settings: TranslatorSettings) {
    if (text === "") {
      return "";
    }
    if (!settings.language) {
      throw "Language is not set";
    }
    const backend = backends.get(settings.backend);
    if (!backend) {
      console.error("cannot find backend:", settings.backend);
      return null;
    }
    const backendSettings = backend.metadata.configurable.reduce(
      (o, item) => {
        const userValue =
          settings.backendSettings[settings.backend]?.[item.key];
        const userValueIsValid =
          typeof userValue === "string" && userValue.length > 0;
        const value = userValueIsValid ? userValue : item.value;
        const valueNeedsToBeConfigured =
          typeof value !== "string" ||
          value.trim().length === 0 ||
          value.replace(" ", "").toLowerCase() === "changeme";
        if (valueNeedsToBeConfigured) {
          throw `Not configured: ${settings.backend}.${item.key}`;
        }
        o[item.key] = value;
        return o;
      },
      <BackendSettings>{},
    );
    return await backend.translate(text, settings.language, backendSettings);
  }

  function getBackends() {
    return Array.from(backends.entries()).map(([key, backend]) => ({
      name: backend.metadata.name,
      key: key,
      configurable: backend.metadata.configurable,
      languages: backend.languages,
    }));
  }

  return { translate, getBackends };
}
