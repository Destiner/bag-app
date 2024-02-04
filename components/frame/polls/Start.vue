<template>
  <div
    style="
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      background: #272727;
      padding-top: 160px;
      align-items: center;
      gap: 24px;
    "
  >
    <div
      style="display: flex; font-size: 96px; color: #f0f0f0; font-weight: bold"
    >
      {{ poll.title }}
    </div>
    <span style="display: flex; font-size: 48px; color: #8e8e8e">
      onchain vote
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  poll: {
    title: String;
  };
}>();
</script>
