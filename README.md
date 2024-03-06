# Onchain Farcaster Frames

This is a directory of onchain frames. Each frame triggers an onchain transaction sourced from the user's Safe.

Using `onchain` to build frames, `permissionless` to run smart accounts, and `Pimlico` to send bundles.

## Bag

Bag is a Safe wallet controlled via frames. Each FID (Farcaster ID) maps to a single address, bringing an onchain Safe wallet to every Farcaster user. Users are then able to execute transactions from the bags they control using different frames.

## Frames

There are 6 frames in total in this repo.

* `bag-claim`: a frame that mints a free "Bag" NFT to the user ([on Warpcast](https://warpcast.com/destiner/0xb5ea11f9))
* `claim-all`: a frame that sends all tokens from the bag wallet ([on Warpcast](https://warpcast.com/destiner/0xb0950e28))
* `degen-raffle`: a frame that distributes a random amount of $DEGEN to each user ([on Warpcast](https://warpcast.com/destiner/0x71fd8d56))
* `nft-sale`: a frame that sells an NFT for a small amount of $DEGEN ([on Warpcast](https://warpcast.com/destiner/0x25add7f0))
* `poll`: a simple onchain voting app that uses [EAS](https://attest.sh) ([on Warpcast](https://warpcast.com/destiner/0xce911d5a))
* `tips`: a tipping app ([on Warpcast](https://warpcast.com/destiner/0xfb75b6bb))

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
