<template>
  <div
    style="
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      background: #272727;
      padding: 50px 30px;
      align-items: center;
      gap: 100px;
    "
  >
    <div
      style="display: flex; font-size: 96px; color: #f0f0f0; font-weight: bold"
    >
      {{ poll.title }}
    </div>
    <div
      style="
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        color: #c5c5c5;
        font-size: 64px;
        width: 100%;
      "
    >
      <div
        v-for="(answer, index) in validAnswers"
        style="display: flex; justify-content: space-between; width: 100%"
      >
        <div style="display: flex; gap: 16px; align-items: center">
          <div style="display: flex; width: 160px">{{ answer.text }}</div>
          <div
            :style="{
              display: 'flex',
              height: '56px',
              width: getBackgroundWidth(index),
              background: getBackgroundColor(index),
            }"
          />
        </div>
        <div style="display: flex; gap: 24px">
          <div style="display: flex">{{ answer.votes }}</div>
          <div style="display: flex">
            ({{ formatPercentage(getPercentage(answer.votes)) }})
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { PollResultAnswer } from "~/utils/frames/polls";

const props = defineProps<{
  poll: {
    title: String;
  };
  answers: PollResultAnswer[];
}>();

const validAnswers = computed(() =>
  props.answers.filter((answer) => answer.text !== undefined)
);

const totalVotes = validAnswers.value.reduce(
  (acc, answer) => acc + answer.votes,
  0
);

function getPercentage(count: number) {
  return (count / totalVotes) * 100;
}

function formatPercentage(percentage: number) {
  return `${percentage.toFixed(0)}%`;
}

function getBackgroundColor(index: number) {
  if (index === 0) {
    return "#B7EBB9";
  }
  if (index === 1) {
    return "#F0C5F7";
  }
  if (index === 2) {
    return "#EFCF7C";
  }
  if (index === 3) {
    return "#76F2FA";
  }
  return "white";
}

function getBackgroundWidth(index: number) {
  const percentage = getPercentage(validAnswers.value[index].votes);
  const maxWidth = 600;
  return `${(percentage / 100) * maxWidth}px`;
}
</script>
