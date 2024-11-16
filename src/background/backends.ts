import { BackendSpec } from "./types";
import google from "./backends/google";
import openai from "./backends/openai";
import deepl from "./backends/deepl";
import ollama from "./backends/ollama";

export const backends = new Map([
  ["google", google],
  ["openai", openai],
  ["deepl", deepl],
  ["ollama", ollama],
]);

export function getBackendSpecs(): BackendSpec[] {
  return Array.from(backends, ([key, backend]) => ({
    key,
    name: backend.metadata.name,
    configSpecs: backend.metadata.configSpecs,
    languageCodes: backend.languageCodes,
  }));
}
