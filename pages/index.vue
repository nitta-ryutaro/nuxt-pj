<template>
  <div class="translation-main-container">
    <h1>翻訳アプリ</h1>
    <select v-model="detectedLang" disabled>
      <option :value="LANG.JA">日本語</option>
      <option :value="LANG.EN">英語</option>
      <option :value="LANG.FR">フランス語</option>
    </select>
    <div class="translation-wrapper">
      <div class="translation-container">
        <textarea
          v-model="text"
          class="translation-textarea"
          placeholder="翻訳したいテキストを入力"
        ></textarea>
      </div>
    </div>
    <div class="result-container">
      <h1>翻訳結果</h1>
      <select v-model="targetLang">
        <option :value="LANG.JA">日本語</option>
        <option :value="LANG.EN">英語</option>
        <option :value="LANG.FR">フランス語</option>
      </select>
      <textarea
        v-model="translatedText"
        class="result-textarea"
        placeholder="翻訳結果が表示されます"
        readonly
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { DetectLangResponse, TranslateResponse } from '~/constants/lang';
import { Lang } from '~/constants/lang';

const text = ref("");
const translatedText = ref("");
const detectedLang = ref(Lang.JA);
const targetLang = ref(Lang.EN);
const sendTranslationController = ref<AbortController>(new AbortController());
const detectLangController = ref<AbortController>(new AbortController());
const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const isAutoDetected = ref(false);

const sendTranslation = async () => {
  if (!text.value.trim()) {
    translatedText.value = "";
    return;
  }

  if (sendTranslationController.value) sendTranslationController.value.abort();
  sendTranslationController.value = new AbortController();

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.value, targetLang: targetLang.value }),
      signal: sendTranslationController.value.signal,
    });

    if (!response.ok) {
      throw new Error("翻訳に失敗しました");
    }

    const data = await response.json() as TranslateResponse;
    translatedText.value = data.translation;
  } catch (error) {
    if (error instanceof Error && error.name == "AbortError") {
      console.log("翻訳リクエストがキャンセルされました");
    } else {
      console.error("翻訳エラー：", error);
    }
  }
}

const detectLang = async () => {
  if (!text.value.trim()) return;
  isAutoDetected.value = true;

  if (detectLangController.value) detectLangController.value.abort();
  detectLangController.value = new AbortController();

  try {
    const response = await fetch("/api/detected-lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.value }),
      signal: detectLangController.value.signal,
    });

    if (!response.ok) {
      throw new Error("言語検出に失敗しました");
    }

    const data = await response.json() as DetectLangResponse;
    console.log("検出された言語：", data.detectedLang);
    detectedLang.value = data.detectedLang;
  } catch (error) {
    if (error instanceof Error && error.name == "AbortError") {
      console.log("言語検出リクエストがキャンセルされました");
    } else {
      console.error("言語検出エラー：", error);
    }
  } finally {
    isAutoDetected.value = false;
  }
};

watch(
  text,
  () => {
    if (debounceTimer.value) clearTimeout(debounceTimer.value);

    debounceTimer.value = setTimeout(async () => {
      await detectLang();
      await sendTranslation();
    }, 500);
  },
  {
    flush: "pre",
  }
);
</script>

<style>
.translation-main-container {
  margin: 0 5% 0;
}

.translation-textarea {
  width: 100%;
  height: 200px;
  resize: none;
}

.result-textarea {
  width: 100%;
  height: 200px;
  resize: none;
}
</style>
