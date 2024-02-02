<template>
  <div class="page">
    <div>Hash: {{ $route.params.hash }}</div>
    <a :href="url">BaseScan</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();

const url = computed(() => {
  return `https://basescan.org/tx/${route.params.hash}`;
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
