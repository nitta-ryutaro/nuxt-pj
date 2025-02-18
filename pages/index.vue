<template>
  <div class="translation-main-container">
    <h1>翻訳アプリ</h1>
      <select v-model="detectedLang">
        <option value="JA">日本語</option>
        <option value="EN">英語</option>
        <option value="FR">フランス語</option>
      </select>
    <div class="translation-wrapper">
      <div class="translation-container">
        <textarea
          v-model="text"
          class="translation-textarea"
          placeholder="翻訳したいテキストを入力(言語は自動で検出されます)"
        ></textarea>
      </div>
    </div>
    <div class="result-container">
      <h1>翻訳結果</h1>
      <select v-model="targetLang">
        <option value="JA">日本語</option>
        <option value="EN">英語</option>
        <option value="FR">フランス語</option>
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

const text = ref("");
const translatedText = ref("");
const detectedLang = ref("JA");
const targetLang = ref("EN");
const sendTranslationController = ref<AbortController>(new AbortController());
const detectLangController = ref<AbortController>(new AbortController());
const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const isAutoDetected = ref(false);

const sendTranslation = async () => {
  if (!text.value.trim()) {
    translatedText.value = "";
    return;
  }

  if (detectedLang.value === targetLang.value) {
    targetLang.value = targetLang.value === "EN" ? "JA" : "EN";
  }

  if (sendTranslationController.value) sendTranslationController.value.abort();
  sendTranslationController.value = new AbortController();

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ text: text.value, targetLang: targetLang.value}),
      signal: sendTranslationController.value.signal,
    });

    if (!response.ok) {
      throw new Error("翻訳に失敗しました");
    }

    const data = await response.json();
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
  if (isAutoDetected.value) return;

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

    const data = await response.json();
    console.log("検出された言語：", data.detectedLang);
    detectedLang.value = data.detectedLang;
  } catch (error) {
    if (error instanceof Error && error.name == "AbortError") {
      console.log("言語検出リクエストがキャンセルされました");
    } else {
      console.error("言語検出エラー：", error);
    }
  }
};

watch(text, () => {
  if (debounceTimer.value) clearTimeout(debounceTimer.value);

  debounceTimer.value = setTimeout(async () => {
    await detectLang();
    sendTranslation();
  }, 500);
});
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
