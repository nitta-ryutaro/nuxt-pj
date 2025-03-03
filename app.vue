<script setup lang="ts">
import { NuxtPage } from '#components';
import { Analytics } from '@vercel/analytics/nuxt'; /* PartiallyEnd: #3632/scriptSetup.vue */
</script>

<template>
  <div>
    <Analytics />
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
