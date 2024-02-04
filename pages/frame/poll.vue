<template></template>

<script setup lang="ts">
import { getFrameMetadata } from "@coinbase/onchainkit";
import type { FrameButtonMetadata } from "@coinbase/onchainkit/dist/types/core/farcasterTypes";

import { getWarpcastProfile } from "~/utils/frames";
// import type { User } from "~/utils/frames/polls";
import { getStartImageUrl, getPoll } from "~/utils/frames/polls";

const route = useRoute();
const config = useRuntimeConfig();

const pollIdString = route.query.pollId as string;
const pollId = parseInt(pollIdString);

const poll = await getPoll(pollId);

const baseUrl = config.public.baseUrl as string;

const imageUrl = getStartImageUrl(baseUrl, poll.question);

const buttons = poll.answers
  .map((answer) => ({
    label: answer,
    action: "post",
  }))
  .slice(0, 4);

const frameMetadata = getFrameMetadata({
  // @ts-ignore
  buttons,
  image: imageUrl,
  post_url: `${baseUrl}/api/frame/polls/vote?pollId=${pollId}`,
});

const frameTags = Object.entries(frameMetadata).map(([key, value]) => ({
  name: key,
  content: value,
}));

useHead({
  title: "Bag Polls",
  meta: [
    ...frameTags,
    {
      name: "og:title",
      content: "Bag Polls",
    },
    {
      name: "og:image",
      content: imageUrl,
    },
  ],
});
</script>
