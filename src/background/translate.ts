import { Settings } from "./types";
import { backends } from "./backends";

export async function translate(text: string, settings: Settings) {
  if (text.length === 0) {
    return "";
  }
  if (settings.targetLanguage.length === 0) {
    throw new Error("target language is empty");
  }
  const backend = backends.get(settings.currentBackend);
  if (!backend) {
    throw new Error("cannot find backend: " + settings.currentBackend);
  }
  return await backend.translate(
    text,
    settings.targetLanguage,
    settings.backendSettings[settings.currentBackend],
  );
}
