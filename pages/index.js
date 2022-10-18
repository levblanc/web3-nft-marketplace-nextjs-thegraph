import styles from '../styles/Home.module.css';
import { useQuery } from '@apollo/client';
import { useMoralis } from 'react-moralis';
import { Skeleton } from 'antd';
import { GET_ACTIVE_ITEMS } from '../constants/subgraphQueries';
import contractAddresses from '../constants/contractAddresses.json';
import NFTCard from '../components/NFTCard';

export default function Home() {
  const { isWeb3Enabled, chainId } = useMoralis();
  const chain = chainId ? parseInt(chainId) : 31337;
  const marketplaceAddress = contractAddresses[chain].NFTMarketplace;

  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS);

  return (
    <div className="container mx-auto text-slate-800">
      <h1 className="mr-5 my-10 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          loading || !data ? (
            <Skeleton active={true} />
          ) : (
            data.activeItems.map(({ price, nftAddress, tokenId, seller }) => {
              return (
                <NFTCard
                  key={`${nftAddress}${tokenId}`}
                  price={price}
                  nftAddress={nftAddress}
                  tokenId={tokenId}
                  seller={seller}
                />
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
