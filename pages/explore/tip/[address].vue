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
  return `https://basescan.org/advanced-filter?fadd=${route.params.address}&txntype=2&amt=10%7e10&tkn=0x4ed4e862860bed51a9570b96d89af5e1b0efefed`;
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
