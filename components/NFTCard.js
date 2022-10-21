import { useState, useEffect } from 'react';
import { CryptoIcon } from 'next-crypto-icons';
import { Card, Skeleton } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import marketplaceAbi from '../constants/marketplaceAbi.json';
import dynamicNFTAbi from '../constants/dynamicNFTAbi.json';
import { truncateAddress } from '../utils/formatter';
import contractUtils from '../utils/contract';
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
  const { isDisconnected, address: userAccount } = useAccount();
  const [imageURI, setImageURI] = useState('');
  const [imageDesc, setImageDesc] = useState('');
  const [cardActions, setCardActions] = useState([]);
  const [showUpdateListingModal, setShowUpdateListingModal] = useState(false);
  const [showCancelListingModal, setShowCancelListingModal] = useState(false);
  const [showBuyItemModal, setShowBuyItemModal] = useState(false);

  const ownedByUser =
    (userAccount && seller === userAccount.toLocaleLowerCase()) ||
    seller === undefined;
  const formattedSellerAddress = ownedByUser ? 'you' : truncateAddress(seller);
  const priceInEther = ethers.utils.formatUnits(price, 'ether');

  const { data: tokenURI, error: readContractError } = contractUtils.read({
    abi: dynamicNFTAbi,
    address: nftAddress,
    functionName: 'tokenURI',
    params: [tokenId],
    enabled: !!tokenId,
  });

  if (readContractError) {
    console.error('Read contract error', readContractError);
  }

  /**
   * @param {number} tokenURI token URI
   * @returns IPFS files from a 'normal' URL
   */
  const ipfsGateway = (tokenURI) => {
    return tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
  };

  /**
   * Update UI:
   * 1. NFT card info: token ID, image, owner, price
   * 2. NFT card actions based on owner
   */
  const updateUI = async () => {
    if (tokenURI) {
      try {
        const { image, description: imageDesc } = await (
          await fetch(ipfsGateway(tokenURI))
        ).json();

        const imageURI = ipfsGateway(image);

        setImageURI(imageURI);
        setImageDesc(imageDesc);

        if (!userAccount) {
          setCardActions([]);
        } else if (ownedByUser) {
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
      } catch (error) {
        console.error(error);
      }
    }
  };

  /**
   * Show modal according to type
   * @param {string} type modal type to show
   */
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
    if (!isDisconnected) {
      updateUI();
    }

    // Remove opening modal if user switches account
    showUpdateListingModal && setShowUpdateListingModal(false);
    showCancelListingModal && setShowCancelListingModal(false);
    showBuyItemModal && setShowBuyItemModal(false);
  }, [isDisconnected, userAccount]);

  return (
    <div className="w-64 mr-5">
      <Card hoverable actions={cardActions}>
        {!imageURI ? (
          <>
            <Skeleton.Image active={true} />
            <Skeleton className="mt-8" active={true} />
          </>
        ) : (
          <>
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
              userAccount={userAccount}
              nftAdress={nftAddress}
              tokenId={tokenId}
              price={priceInEther}
            />

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
    </div>
  );
};

export default NFTBox;
