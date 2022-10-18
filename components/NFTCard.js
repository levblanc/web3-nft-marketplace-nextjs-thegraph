import { useState, useEffect } from 'react';
import { useWeb3Contract, useMoralis } from 'react-moralis';
import { CryptoIcon } from 'next-crypto-icons';
import { Card, Skeleton } from 'antd';
import Image from 'next/image';
import { ethers } from 'ethers';
import marketplaceAbi from '../constants/marketplaceAbi.json';
import dynamicNFTAbi from '../constants/dynamicNFTAbi.json';
import { truncateAddress } from '../utils/formatter';
import UpdateListingModal from './UpdateListingModal';

const NFTBox = ({
  price,
  nftAddress,
  tokenId,
  // marketplaceAddress,
  seller,
}) => {
  const { isWeb3Enabled, account } = useMoralis();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageURI, setImageURI] = useState('');
  const [imageDesc, setImageDesc] = useState('');

  const { runContractFunction: getTokenURI } = useWeb3Contract({
    abi: dynamicNFTAbi,
    contractAddress: nftAddress,
    functionName: 'tokenURI',
    params: {
      tokenId,
    },
  });

  /**
   * @param tokenURI token URI
   * @returns IPFS files from a 'normal' URL
   */
  const ipfsGateway = (tokenURI) => {
    return tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
  };

  const updateUI = async () => {
    setImageLoading(true);

    const tokenURI = await getTokenURI();

    const { image, description: imageDesc } = await (
      await fetch(ipfsGateway(tokenURI))
    ).json();

    const imageURI = ipfsGateway(image);

    setImageLoading(false);
    setImageURI(imageURI);
    setImageDesc(imageDesc);
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const ownedByUser = seller === account || seller === undefined;
  const formattedSellerAddress = ownedByUser ? 'you' : truncateAddress(seller);

  return (
    <Card className="w-64 mr-5" hoverable>
      {/* {!imageURI ? ( */}
      {imageLoading ? (
        <>
          <Skeleton.Image active={true} />
          <Skeleton className="mt-8" active={true} />
        </>
      ) : (
        <>
          <div className="p-4 bg-yellow-50">
            <Image
              loader={() => imageURI}
              unoptimized={true}
              src={imageURI}
              width={200}
              height={200}
              alt={imageDesc}
            />
          </div>
          <div className="font-bold text-slate-600 rounded-b-lg px-2">
            <div className="text-lg mt-4">PixCats #{tokenId}</div>
            <div className="italic text-sm">
              Owned by {formattedSellerAddress}
            </div>
            <div className="flex flex-row items-center mt-4 text-lg">
              <CryptoIcon name="eth" width={18} style={'color'} />
              <div className="ml-2">
                {ethers.utils.formatUnits(price, 'ether')} ETH
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default NFTBox;
