import { createError, defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.text || typeof body.text !== "string") {
        throw createError({ statusCode: 400, statusMessage: "無効なリクエスト: text が必要です" })
    };

    const api_key = process.env.API_KEY;

    if (!api_key) {
        throw createError({ statusCode: 500, statusMessage: "APIキーが設定されていません" });
    }

    const url = "https://api-free.deepl.com/v2/translate";

    if (!api_key) {
        throw createError({ statusCode: 500, statusMessage: "APIキーが設定されていません"});
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `DeepL-Auth-Key ${api_key}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                text: body.text,
                target_lang: "EN",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(errorText)
            throw createError({ statusCode: response.status, statusMessage: `DeepL API エラー: ${errorText}` });
        }

        const data = await response.json();
        return {
            detectedLang: data.translations[0].detected_source_language,
         };
    } catch (error) {
        if (error instanceof Error) {
            throw createError({ statusCode: 500, statusMessage: error.message });
        }
    }
})