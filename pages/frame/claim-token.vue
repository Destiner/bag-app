<template></template>

<script setup lang="ts">
import { getFrameMetadata } from "@coinbase/onchainkit";

import { getImageUrl } from "~/utils/frames/claim-token";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;

const imageUrl = getImageUrl(
  baseUrl,
  "claim $DOG",
  "from your bag wallet",
  "limited offer, ending soon"
);

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Check",
      action: "post",
    },
  ],
  image: imageUrl,
  post_url: `${baseUrl}/api/frame/claim-token/start`,
});

const frameTags = Object.entries(frameMetadata).map(([key, value]) => ({
  name: key,
  content: value,
}));

useHead({
  title: "Bag Claim Token",
  meta: [
    ...frameTags,
    {
      name: "og:title",
      content: "Bag Claim Token",
    },
    {
      name: "og:image",
      content: imageUrl,
    },
  ],
});
</script>
