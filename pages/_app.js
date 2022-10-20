import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import Head from 'next/head';
import Header from '../components/Header';

const { chains, provider } = configureChains(
  [chain.goerli],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'NFT Marketplace',
  chains,
});

const wagmiClient = createClient({
  connectors,
  provider,
});

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: process.env.NEXT_PUBLIC_THE_GRAPH_QUERY_URI,
});

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <ApolloProvider client={apolloClient}>
            <Header />
            {/* <Component {...pageProps} /> */}
          </ApolloProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </div>
  );
}

export default MyApp;
