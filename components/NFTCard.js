import { useState, useEffect } from 'react';
import { useWeb3Contract, useMoralis } from 'react-moralis';
import { CryptoIcon } from 'next-crypto-icons';
import { Card, Skeleton } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { ethers } from 'ethers';
import marketplaceAbi from '../constants/marketplaceAbi.json';
import dynamicNFTAbi from '../constants/dynamicNFTAbi.json';
import { truncateAddress } from '../utils/formatter';
import UpdateListingModal from './UpdateListingModal';
import CancelListingModal from './CancelListingModal';
import BuyItemModal from './BuyItemModal';

const NFTBox = ({
  chain,
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
  const [cardActions, setCardActions] = useState([]);
  const [showUpdateListingModal, setShowUpdateListingModal] = useState(false);
  const [showCancelListingModal, setShowCancelListingModal] = useState(false);
  const [showBuyItemModal, setShowBuyItemModal] = useState(false);

  const ownedByUser = seller === account || seller === undefined;
  const formattedSellerAddress = ownedByUser ? 'you' : truncateAddress(seller);
  const priceInEther = ethers.utils.formatUnits(price, 'ether');

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

    if (ownedByUser) {
      setCardActions([
        <div
          className="flex flex-row items-center justify-center hover:font-bold"
          key="cancelListing"
          onClick={() => showModal('cancel')}
        >
          <DeleteOutlined className="mr-2" />
          Remove
        </div>,
        <div
          className="flex flex-row items-center justify-center hover:font-bold"
          key="updateListing"
          onClick={() => showModal('update')}
        >
          <EditOutlined className="mr-2" />
          Update
        </div>,
      ]);
    } else {
      setCardActions([
        <div
          className="flex flex-row items-center justify-center hover:font-bold"
          key="updateListing"
          onClick={() => showModal('buy')}
        >
          Buy NFT
        </div>,
      ]);
    }
  };

  const showModal = (type) => {
    switch (type) {
      case 'update':
        setShowUpdateListingModal(true);
        break;

      case 'cancel':
        setShowCancelListingModal(true);
        break;

      case 'buy':
        setShowBuyItemModal(true);
        break;

      default:
        console.error(`"type" is ${type} in showModal function.`);
        break;
    }
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  return (
    <Card className="w-64 mr-5" hoverable actions={cardActions}>
      <UpdateListingModal
        key={'update-listing-modal'}
        isVisible={showUpdateListingModal}
        hideModal={() => setShowUpdateListingModal(false)}
        nftAdress={nftAddress}
        tokenId={tokenId}
        price={priceInEther}
      />

      <CancelListingModal
        key={'cancel-listing-modal'}
        isVisible={showCancelListingModal}
        hideModal={() => setShowCancelListingModal(false)}
        nftAdress={nftAddress}
        tokenId={tokenId}
      />

      <BuyItemModal
        key={'buy-item-modal'}
        isVisible={showBuyItemModal}
        hideModal={() => setShowBuyItemModal(false)}
        chain={chain}
        userAccount={account}
        nftAdress={nftAddress}
        tokenId={tokenId}
        price={priceInEther}
      />

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
              <div className="ml-2">{priceInEther} ETH</div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default NFTBox;
