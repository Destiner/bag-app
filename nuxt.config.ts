import PluginImage from "@rollup/plugin-image";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["unplugin-font-to-buffer/nuxt", "v-satori/nuxt"],
  runtimeConfig: {
    neynarApiKey: process.env.NUXT_NEYNAR_API_KEY,
    sponsorMnemonic: process.env.NUXT_SPONSOR_MNEMONIC,
    aaPrivateKey: process.env.NUXT_AA_PRIVATE_KEY,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    },
  },
  devtools: { enabled: true },
  nitro: {
    rollupConfig: {
      // @ts-ignore
      plugins: [
        PluginImage({
          include: "**/*.png",
        }),
      ],
    },
  },
});
