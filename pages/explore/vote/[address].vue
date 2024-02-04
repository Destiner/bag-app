<template>
  <div class="page">
    <div>Address: {{ $route.params.address }}</div>
    <a :href="url">Tips</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();

const url = computed(() => {
  return `https://basescan.org/address/${route.params.address}#events`;
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
