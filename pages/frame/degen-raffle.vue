<template></template>

<script setup lang="ts">
import { getFrameMetadata } from "@coinbase/onchainkit";

import { getImageUrl } from "~/utils/frames/degen-raffle";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;

const imageUrl = getImageUrl(baseUrl, "Spin below ↓", "normal");

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Spin",
      action: "post",
    },
  ],
  image: imageUrl,
  post_url: `${baseUrl}/api/frame/degen-raffle/spin`,
});

const frameTags = Object.entries(frameMetadata).map(([key, value]) => ({
  name: key,
  content: value,
}));

useHead({
  title: "Bag Raffle",
  meta: [
    ...frameTags,
    {
      name: "og:title",
      content: "Bag Raffle",
    },
    {
      name: "og:image",
      content: imageUrl,
    },
  ],
});
</script>
