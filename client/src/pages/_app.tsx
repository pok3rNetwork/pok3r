import { ChakraProvider } from '@chakra-ui/react';

import theme from '../theme';
import { AppProps } from 'next/app';

import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  wallet,
  darkTheme,
  midnightTheme,
} from '@rainbow-me/rainbowkit';

import {
  chain,
  WagmiConfig,
  createClient,
  defaultChains,
  configureChains,
} from 'wagmi';

import { alchemyProvider } from 'wagmi/providers/alchemy';
const alchemyId: any = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const { chains, provider, webSocketProvider } = configureChains(
  [chain.polygonMumbai],
  [alchemyProvider({ apiKey: alchemyId })]
);

const { wallets } = getDefaultWallets({
  appName: 'POK3R',
  chains,
});

const demoAppInfo = {
  appName: 'POK3r',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      wallet.argent({ chains }),
      wallet.trust({ chains }),
      wallet.ledger({ chains }),
      wallet.omni({ chains }),
      wallet.imToken({ chains }),
    ],
  },
]);

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <RainbowKitProvider
        appInfo={demoAppInfo}
        chains={chains}
        theme={darkTheme({
          ...darkTheme.accentColors.red,
        })}
      >
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
