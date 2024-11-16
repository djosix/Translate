export interface Settings {
  targetLanguage: string;
  currentBackend: string;
  backendSettings: {
    [name: string]: BackendSettings;
  };
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

export interface Backend {
  metadata: {
    name: string;
    configSpecs: BackendConfigSpec[];
  };
  translate: (
    inputText: string,
    targetLanguage: string,
    backendSettings: BackendSettings,
  ) => Promise<string>;
  languageCodes?: Map<string, string>;
}

export interface BackendSettings {
  [field: string]: string;
}

export interface BackendSpec {
  key: string;
  name: string;
  configSpecs: BackendConfigSpec[];
  languageCodes?: Map<string, string>;
}

export interface BackendConfigSpec {
  name: string;
  type: string;
  key: string;
  defaultValue: string;
}
