<template></template>

<script setup lang="ts">
import { getFrameMetadata } from "@coinbase/onchainkit";

import { getStartImageUrl } from "~/utils/frames/nft-sale";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;

const imageUrl = getStartImageUrl(baseUrl);

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Buy",
      action: "post",
    },
  ],
  image: imageUrl,
  post_url: `${baseUrl}/api/frame/nft-sale/buy`,
});

const frameTags = Object.entries(frameMetadata).map(([key, value]) => ({
  name: key,
  content: value,
}));

useHead({
  title: "Bag NFT Sale",
  meta: [
    ...frameTags,
    {
      name: "og:title",
      content: "Bag NFT Sale",
    },
    {
      name: "og:image",
      content: imageUrl,
    },
  ],
});
</script>
