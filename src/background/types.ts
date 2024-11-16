
export interface TranslatorSettings {
    backend: string;
    language: string;
    [key: string]: any; // backend specific settings
}

export interface Settings {
    translator: TranslatorSettings;
    enableTooltip: boolean;
}
