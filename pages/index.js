import { useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useAccount, useProvider } from 'wagmi';
import { Skeleton } from 'antd';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';
import { GET_ACTIVE_ITEMS } from '../constants/subgraphQueries';
import contractAddresses from '../constants/contractAddresses.json';
import NFTCard from '../components/NFTCard';

export default function Home() {
  setTwoToneColor('#f5222d');
  const {
    network: { chainId },
  } = useProvider();
  const { isDisconnected } = useAccount();
  const chain = chainId ? parseInt(chainId) : 31337;
  const marketplaceAddress = contractAddresses[chain].NFTMarketplace;

  const [fetchActiveItems, { loading, error: fetchActiveItemError, data }] =
    useLazyQuery(GET_ACTIVE_ITEMS);

  useEffect(() => {
    if (!isDisconnected) {
      try {
        fetchActiveItems();
      } catch (error) {
        console.error(`Fetch active item error: ${error}`);
      }
    }
  }, [isDisconnected]);

  return (
    <div className="container mx-auto text-slate-800">
      {!isDisconnected ? (
        loading ? (
          <Skeleton className="mt-10" active={true} />
        ) : fetchActiveItemError ? (
          <div className="items-center mt-20">
            <ExclamationCircleTwoTone style={{ fontSize: '50px' }} />
            <div className="mt-5 text-xl">Network Error, please retry.</div>
          </div>
        ) : (
          <>
            <h1 className="mr-5 my-10 font-bold text-2xl">Recently Listed</h1>
            <div className="flex flex-wrap">
              {data &&
                data.activeItems.map(
                  ({ price, nftAddress, tokenId, seller }) => {
                    return (
                      <NFTCard
                        key={`${nftAddress}${tokenId}`}
                        chain={chain}
                        price={price}
                        nftAddress={nftAddress}
                        tokenId={tokenId}
                        seller={seller}
                      />
                    );
                  }
                )}
            </div>
          </>
        )
      ) : (
        <div className="flex flex-col items-center">
          <p className="font-bold text-xl text-center pt-20 pb-10">
            Connect a wallet to use NFT Marketplace
          </p>
          <ConnectButton />
        </div>
      )}
    </div>
  );
}
