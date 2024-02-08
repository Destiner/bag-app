<template></template>

<script setup lang="ts">
import { getFrameMetadata } from "@coinbase/onchainkit";

import { getStartImageUrl } from "~/utils/frames/claim-all";

const config = useRuntimeConfig();

const baseUrl = config.public.baseUrl as string;

const imageUrl = getStartImageUrl(baseUrl);

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Claim",
      action: "post",
    },
  ],
  image: imageUrl,
  post_url: `${baseUrl}/api/frame/claim-all/claim`,
});

const frameTags = Object.entries(frameMetadata).map(([key, value]) => ({
  name: key,
  content: value,
}));

useHead({
  title: "Bag Claim All",
  meta: [
    ...frameTags,
    {
      name: "og:title",
      content: "Bag Claim All",
    },
    {
      name: "og:image",
      content: imageUrl,
    },
  ],
});
</script>
