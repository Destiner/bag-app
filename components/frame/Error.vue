<template>
  <div
    style="
      background: #1b1616;
      color: #ffffff;
      height: 100%;
      width: 100%;
      display: flex;
      padding: 100px 48px;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
    "
  >
    <div style="display: flex; flex-direction: column; gap: 32px">
      <div style="display: flex; font-size: 48px">Something went wrong!</div>
      <div
        style="
          display: flex;
          font-size: 36px;
          color: #aaaaaa;
          flex-direction: column;
          gap: 4px;
        "
      >
        <div>Please reload the page</div>
        <div>or try again later</div>
      </div>
    </div>
    <div style="display: flex">
      <div style="display: flex; font-size: 40px; color: #e56b6b">
        {{ reason }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  reason: string | undefined;
}>();
</script>
