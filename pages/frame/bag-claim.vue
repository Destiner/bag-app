<template></template>

<script setup lang="ts">
import { getFrameMetadata } from "@coinbase/onchainkit";

import { getImageUrl } from "~/utils/frames/bag-claim";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;

const imageUrl = getImageUrl(baseUrl, "Sold Out!", "normal");

const frameMetadata = getFrameMetadata({
  image: imageUrl,
});

const frameTags = Object.entries(frameMetadata).map(([key, value]) => ({
  name: key,
  content: value,
}));

useHead({
  title: "Bag Launch",
  meta: [
    ...frameTags,
    {
      name: "og:title",
      content: "Bag Launch",
    },
    {
      name: "og:image",
      content: imageUrl,
    },
  ],
});
</script>
