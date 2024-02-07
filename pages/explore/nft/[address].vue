//

<template>
  <div class="page">
    <div>Address: {{ $route.params.address }}</div>
    <a :href="url">BaseScan</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();

const url = computed(() => {
  return `https://basescan.org/token/0x02a94f6292a00233eb07b2d8d403e911924e1948?a=${route.params.address}#inventory`;
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
