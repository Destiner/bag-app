<template>
  <div class="page">
    <div>Bag address: {{ $route.params.from }}</div>
    <div>Main address: {{ $route.params.to }}</div>
    <a :href="url">Tips</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();

const url = computed(() => {
  return `https://basescan.org/advanced-filter?fadd=${route.params.from}&tadd=${route.params.to}`;
});

navigateTo(url.value, {
  external: true,
});
</script>

<style scoped>
.page {
  height: 80vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
</style>
