<template></template>

<script setup lang="ts">
import { getFrameMetadata } from "@coinbase/onchainkit";

import { getWarpcastProfile } from "~/utils/frames";
import type { User } from "~/utils/frames/tips";
import { getImageUrl } from "~/utils/frames/tips";

const route = useRoute();
const config = useRuntimeConfig();

const userUsername = route.params.username as string;
const baseUrl = config.public.baseUrl as string;

const warpcastProfile = await getWarpcastProfile(userUsername);

if (warpcastProfile.result) {
  const fid = warpcastProfile.result.user.fid;
  const active = warpcastProfile.result.user.activeOnFcNetwork;
  const userAvatar = warpcastProfile.result.user.avatar;
  const userName = warpcastProfile.result.user.displayName;

  if (userAvatar && userName) {
    const user: User = {
      username: userUsername,
      avatar: userAvatar,
      name: userName,
    };

    const imageUrl = getImageUrl(baseUrl, user, {
      text: undefined,
      status: "normal",
    });

    const frameMetadata = getFrameMetadata({
      buttons: [
        {
          label: "Tip",
          action: "post",
        },
      ],
      image: imageUrl,
      post_url: `${baseUrl}/api/frame/tips/tip?fid=${fid}&active=${active}&username=${userUsername}&avatar=${userAvatar}&name=${userName}`,
    });

    const frameTags = Object.entries(frameMetadata).map(([key, value]) => ({
      name: key,
      content: value,
    }));

    useHead({
      title: "Bag Tips",
      meta: [
        ...frameTags,
        {
          name: "og:title",
          content: "Bag Tips",
        },
        {
          name: "og:image",
          content: imageUrl,
        },
      ],
    });
  }
}
</script>
