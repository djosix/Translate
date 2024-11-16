export interface Backend {
  metadata: {
    name: string;
    configurable: {
      name: string;
      type: string;
      key: string;
      value: string;
    }[];
  };
  translate: (
    text: string,
    targetLanguage: string,
    settings: BackendSettings,
  ) => Promise<string>;
  languages?: { [key: string]: string };
}

export interface BackendSettings {
  [key: string]: string;
}
