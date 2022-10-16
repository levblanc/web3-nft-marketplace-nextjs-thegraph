import styles from '../styles/Home.module.css';
import { useQuery } from '@apollo/client';
import { useMoralis } from 'react-moralis';
import { GET_ACTIVE_ITEMS } from '../constants/subgraphQueries';
import contractAddresses from '../constants/contractAddresses.json';

export default function Home() {
  const { isWeb3Enabled, chainId } = useMoralis();
  const chain = chainId ? parseInt(chainId) : 31337;
  const marketplaceAddress = contractAddresses[chain].NFTMarketplace;

  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS);
  console.log('data', data);
  return (
    <div className="container mx-auto">
      <h1 className="px-4 py-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          loading || !data ? (
            <div>Loading......</div>
          ) : (
            data.activeItems.map(({ price, nftAddress, tokenId, seller }) => {
              return (
                <div key={`${nftAddress}${tokenId}`}>
                  <div>{price}</div>
                  <div>{nftAddress}</div>
                  <div>{tokenId}</div>
                  <div>{seller}</div>
                </div>
              );
            })
          )
        ) : (
          <div>Web3 Currently Not Enabled </div>
        )}
      </div>
    </div>
  );
}
