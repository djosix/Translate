export interface TranslatorSettings {
  backend: string;
  language: string;
  [key: string]: any; // backend specific settings
}

export interface Settings {
  translator: TranslatorSettings;
  enableTooltip: boolean;
}

export type Request =
  | {
      action: "translate";
      text: string;
    }
  | {
      action: "backends";
    }
  | {
      action: "settings";
      settings: Settings;
    };
