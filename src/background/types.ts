export interface TranslatorSettings {
  language: string;
  backend: string;
  backendSettings: {
    [name: string]: {
      [field: string]: string;
    };
  };
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
