import '../styles/globals.css';
import Head from 'next/head';
import { MoralisProvider } from 'react-moralis';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import Header from '../components/Header';

const client = new ApolloClient({
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
      <MoralisProvider initializeOnMount={false}>
        <ApolloProvider client={client}>
          <Header />
          <Component {...pageProps} />
        </ApolloProvider>
      </MoralisProvider>
    </div>
  );
}

export default MyApp;
