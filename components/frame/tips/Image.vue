<template>
  <div
    :style="{
      position: 'relative',
      background: background,
      color: '#000000',
      height: '100%',
      width: '100%',
      display: 'flex',
      padding: '44px 50px',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    }"
  >
    <div style="display: flex; font-size: 96px; font-weight: bold; gap: 60px">
      <div style="display: flex">Tip</div>
      <div style="display: flex; gap: 20px">
        <img
          v-if="target.avatar"
          :src="target.avatar"
          style="
            width: 96px;
            height: 96px;
            border-radius: 50%;
            border: 2px solid black;
          "
        />
        <div style="display: flex">{{ target.username }}</div>
      </div>
    </div>
    <div style="display: flex; width: 100%">
      <div
        style="
          display: flex;
          flex-direction: column;
          gap: 14px;
          font-size: 48px;
          color: #444444;
        "
      >
        <div style="display: flex; gap: 16px; align-items: flex-end">
          <div style="font-size: 20px; margin-bottom: 6px; width: 80px">
            from
          </div>
          Your Bag
        </div>
        <div style="display: flex; gap: 16px; align-items: flex-end">
          <div style="font-size: 20px; margin-bottom: 10px; width: 80px">
            to
          </div>
          {{ target.name }}`s Bag
        </div>
        <div style="display: flex; gap: 24px; align-items: flex-end">
          <div style="font-size: 20px; margin-bottom: 6px; width: 80px">
            amount
          </div>
          <div style="display: flex; font-size: 40px">10 $DEGEN</div>
        </div>
      </div>
      <div
        :style="{
          position: 'absolute',
          right: '0',
          bottom: '0',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          background: '#00000033',
          fontSize: '64px',
          fontWeight: 'bold',
          padding: '15px 24px',
          borderRadius: '20px',
          color: messageColor,
        }"
        v-if="message.text"
      >
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { Status } from "~/utils/frames/tips";

const props = defineProps<{
  target: {
    username: string;
    avatar: string | undefined;
    name: string;
  };
  message: {
    text: string | undefined;
    status: Status;
  };
}>();

const background = computed(() => {
  switch (props.message.status) {
    case "success":
      return "#DFE6CB";
    case "error":
      return "#E2DFC9";
    default:
      return "#E7EAD3";
  }
});

const messageColor = computed(() => {
  switch (props.message.status) {
    case "success":
      return "#2C802A";
    case "error":
      return "#9F1C1C";
    default:
      return "#000000";
  }
});
</script>
