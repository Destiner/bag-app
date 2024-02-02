<template>
  <div
    style="
      background: #b4c8de;
      color: #171717;
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
      <div style="font-size: 64px; font-weight: bold; font-family: InterBold">
        $DEGEN Raffle
      </div>
      <div
        style="
          display: flex;
          flex-direction: column;
          color: #1d1c1c;
          font-size: 40px;
        "
      >
        <span>Instant win game</span>
        <span>straight to your bag</span>
      </div>
    </div>
    <span
      :style="{
        color: messageColor,
        'font-size': messageFontSize,
        'font-weight': messageFontWeight,
        'font-family': messageFontFamily,
      }"
    >
      {{ message.text }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { ImageType } from "~/utils/frames/degen-raffle";

const props = defineProps<{
  message: {
    text: string;
    type: ImageType;
  };
}>();

const messageColor = computed(() => {
  switch (props.message.type) {
    case "normal":
      return "#212121";
    case "success":
      return "#701478";
    case "error":
      return "#bb1111";
  }
});

const messageFontSize = computed(() => {
  switch (props.message.type) {
    case "normal":
    case "success":
      return "48px";
    case "error":
      return "36px";
  }
});

const messageFontWeight = computed(() => {
  switch (props.message.type) {
    case "normal":
      return "normal";
    case "success":
      return "bold";
    case "error":
      return "normal";
  }
});

const messageFontFamily = computed(() => {
  switch (props.message.type) {
    case "normal":
      return "Inter";
    case "success":
      return "InterBold";
    case "error":
      return "Inter";
  }
});
</script>
