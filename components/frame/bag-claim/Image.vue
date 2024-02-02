<template>
  <div
    style="
      background: #0c0b0b;
      color: #e0e0e0;
      height: 100%;
      width: 100%;
      display: flex;
      padding: 56px 70px;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
    "
  >
    <div style="display: flex; flex-direction: column; gap: 28px">
      <div style="font-size: 64px">Bag</div>
      <div style="color: #8c8c8c; font-size: 40px">Frame-native wallet</div>
    </div>
    <span :style="{ color: messageColor, 'font-size': messageFontSize }">
      {{ message.text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { ImageType } from "~/utils/frames/bag-claim";

const props = defineProps<{
  message: {
    text: string;
    type: ImageType;
  };
}>();

const messageColor = computed(() => {
  switch (props.message.type) {
    case "normal":
      return "#bdbdbd";
    case "success":
      return "#73f296";
    case "error":
      return "#de6c6c";
    case "warn":
      return "#d79d46";
  }
});

const messageFontSize = computed(() => {
  switch (props.message.type) {
    case "normal":
    case "success":
      return "48px";
    case "error":
      return "36px";
    case "warn":
      return "36px";
  }
});
</script>
