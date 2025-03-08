export enum Lang {
  JA = "ja",
  EN = "en",
  FR = "fr",
}

export interface DetectLangResponse {
    detectedLang: Lang;
}

export interface TranslateResponse {
    translation: string;
}