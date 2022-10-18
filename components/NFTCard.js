import { useState, useEffect } from 'react';
import { useWeb3Contract, useMoralis } from 'react-moralis';
import { Card } from '@web3uikit/core';
import Image from 'next/image';
import { ethers } from 'ethers';
import marketplaceAbi from '../constants/marketplaceAbi.json';
import dynamicNFTAbi from '../constants/dynamicNFTAbi.json';
import { truncateAddress } from '../utils/formatter';

const NFTBox = ({
  price,
  nftAddress,
  tokenId,
  // marketplaceAddress,
  seller,
}) => {
  const { isWeb3Enabled, account } = useMoralis();
  const [imageTitle, setImageTitle] = useState('');
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
    const tokenURI = await getTokenURI();

    const {
      name: imageTitle,
      image,
      description: imageDesc,
    } = await (await fetch(ipfsGateway(tokenURI))).json();
    const imageURI = ipfsGateway(image);

    setImageTitle(imageTitle);
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
    <div>
      {imageURI ? (
        <div className="flex flex-col items-begin mr-5 rounded-lg drop-shadow-lg bg-white">
          <div className="p-4 bg-yellow-50">
            <Image
              loader={() => imageURI}
              src={imageURI}
              width={200}
              height={200}
              alt={imageDesc}
            />
          </div>
          <div className="font-bold text-slate-600 rounded-b-lg p-2">
            <div className="text-lg mt-2">PixCats #{tokenId}</div>
            <div className="italic text-sm">
              Owned by {formattedSellerAddress}
            </div>
            <div className="text-sm mt-4">Price</div>
            <div>{ethers.utils.formatUnits(price, 'ether')} ETH</div>
          </div>
        </div>
      ) : (
        <div>Loading ...</div>
      )}
    </div>
  );
};

export default NFTBox;
