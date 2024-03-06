<template>
  <div
    style="
      align-items: center;
      background: black;
      background-size: 100% 100%;
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      height: 100%;
      justify-content: space-between;
      text-align: center;
      width: 100%;
    "
  >
    <div
      style="
        margin-top: 240px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 48px;
      "
    >
      <div
        style="
          color: white;
          font-size: 40;
          font-style: bold;
          letter-spacing: -0.025em;
          line-height: 1.4;
          padding: 0 120px;
          white-space: pre-wrap;
        "
      >
        {{ title }}
      </div>
      <div
        style="
          color: #ababab;
          font-size: 40;
          font-style: normal;
          letter-spacing: -0.025em;
          line-height: 1.4;
          padding: 0 120px;
          white-space: pre-wrap;
        "
      >
        {{ subtitle }}
      </div>
    </div>
    <div
      style="
        color: #818181;
        font-size: 32;
        margin-bottom: 40px;
        font-style: normal;
        letter-spacing: -0.025em;
        line-height: 1.4;
        padding: 0 120px;
        white-space: pre-wrap;
      "
    >
      {{ note }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  note?: string;
}>();
</script>
