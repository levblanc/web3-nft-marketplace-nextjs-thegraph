import { Modal, InputNumber, Button, notification, Spin } from 'antd';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useProvider } from 'wagmi';
import { useState } from 'react';
import { ethers } from 'ethers';
import contractAddresses from '../constants/contractAddresses.json';
import dynamicNFTAbi from '../constants/dynamicNFTAbi.json';
import marketplaceAbi from '../constants/marketplaceAbi.json';
import contractUtils from '../utils/contract';
import { markAssetError } from 'next/dist/client/route-loader';
import { list } from 'postcss';
import Link from 'next/link';

const ListNFT = () => {
  const {
    network: { chainId },
  } = useProvider();
  const { isDisconnected } = useAccount();
  const chain = chainId ? parseInt(chainId) : 31337;
  const marketplaceAddress = contractAddresses[chain].NFTMarketplace;
  const dynamicNFTAddress = contractAddresses[chain].DynamicNFT;

  const [tokenId, setTokenId] = useState('');
  const [tokenIdError, setTokenIdError] = useState('');
  const [enableApproveBtn, setEnableApproveBtn] = useState(true);
  const [nftApproved, setNftApproved] = useState(false);
  const [listingPrice, setListingPrice] = useState('');
  const [priceInEther, setPriceInEther] = useState(listingPrice);
  const [priceError, setPriceError] = useState('');
  const [enableListingBtn, setEnableListingBtn] = useState(false);
  const [errorModalMsg, setErrorModalMessage] = useState([]);

  const handleTokenIdChange = (value) => {
    if (!value) {
      setTokenIdError('Token ID can not be empty!');
      enableApproveBtn && setEnableApproveBtn(false);
    } else if (Number(value) < 0) {
      setTokenIdError('Token ID must be greater than 0!');
      enableApproveBtn && setEnableApproveBtn(false);
    } else {
      tokenIdError && setTokenIdError('');
      setEnableApproveBtn(true);
    }

    setTokenId(value);
  };

  const handlePriceChange = (value) => {
    if (!value) {
      setPriceError('Item price can not be empty!');
      enableListingBtn && setEnableListingBtn(false);
    } else if (value === '0') {
      setPriceError('Item price must be greater than 0');
      enableListingBtn && setEnableListingBtn(false);
    } else {
      priceError && setPriceError('');
      setEnableListingBtn(true);
    }

    setListingPrice(value);
    setPriceInEther(ethers.utils.parseEther(value).toString());
  };

  const handleApprovalSuccess = async (tx) => {
    notification.open({
      message: 'Approving NFT...',
      description: 'Transaction is pending, please wait.',
      icon: <Spin />,
      duration: 10,
    });

    try {
      await tx.wait(1);
      await refetchApprovedItems();

      setNftApproved(true);

      notification.success({
        message: 'Transaction Confirmed!',
        description: `NFT approved!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleListingSuccess = async (tx) => {
    notification.open({
      message: 'Listing NFT...',
      description: 'Transaction is pending, please wait.',
      icon: <Spin />,
      duration: 10,
    });

    try {
      await tx.wait(1);

      setListingPrice('0');
      setPriceInEther(listingPrice);

      notification.success({
        message: 'Transaction Confirmed!',
        description: `NFT Listed!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleError = (error) => {
    const { code, message: errMsg } = error;

    if (code && code === 'ACTION_REJECTED') {
      setErrorModalMessage(['User rejected transaction!']);
      return;
    }

    if (message) {
      setErrorModalMessage([errMsg]);
      return;
    }

    setErrorModalMessage([JSON.stringify(error)]);
  };

  const { write: approveNFT, isLoading: approveNFTLoading } =
    contractUtils.write({
      abi: dynamicNFTAbi,
      address: dynamicNFTAddress,
      functionName: 'approve',
      params: [marketplaceAddress, tokenId],
      onSuccess: handleApprovalSuccess,
      onError: handleError,
      enabled: marketplaceAddress && tokenId,
    });

  const {
    write: listItem,
    isLoading: listItemLoading,
    refetch: refetchApprovedItems,
  } = contractUtils.write({
    abi: marketplaceAbi,
    address: marketplaceAddress,
    functionName: 'listItem',
    params: [dynamicNFTAddress, tokenId, priceInEther],
    onSuccess: handleListingSuccess,
    onError: handleError,
    enabled: dynamicNFTAddress && tokenId && listingPrice,
  });

  const handleSubmit = (e, type) => {
    switch (type) {
      case 'approval':
        if (!approveNFT) {
          setErrorModalMessage(['Please make sure you own this NFT.']);
          return;
        }

        approveNFT();
        break;

      case 'listing':
        if (!listItem) {
          setErrorModalMessage([
            "1. You haven't approve to list the NFT yet. Please approve first OR wait for approval result.",
            '2. NFT is already listed.',
          ]);
          return;
        }

        listItem();

      default:
        console.log('Submit type is: ', type);
        break;
    }
  };

  const ErrorModal = () => {
    const ErrorTitle = (
      <div className="flex flex-row items-center">
        <ExclamationCircleTwoTone
          className="mr-2"
          style={{ fontSize: '20px' }}
          twoToneColor="#f5222d"
        />
        Error Approving or Listing NFT
      </div>
    );

    return (
      <Modal
        open={true}
        centered
        title={ErrorTitle}
        closable={false}
        footer={[
          <Button
            key="back"
            type="primary"
            onClick={() => setErrorModalMessage('')}
          >
            OK
          </Button>,
        ]}
      >
        {errorModalMsg.map((msgItem, index) => {
          return <p key={index}>{msgItem}</p>;
        })}
      </Modal>
    );
  };

  return (
    <div className="container mx-auto text-slate-800">
      {!isDisconnected ? (
        <>
          {errorModalMsg && <ErrorModal />}

          <h1 className="mt-10 mb-3 font-bold text-2xl">
            List your NFT to Marketplace
          </h1>

          <div className="italic text-base mb-10">
            {' '}
            Not owning any NFT yet?{' '}
            <Link href="/mint-nft">
              <a>Mint One NOW!</a>
            </Link>{' '}
          </div>

          {/* Approve for Marketplace to sell the NFT */}
          <div className="font-bold text-xl mb-2">
            1. Approve to List your NFT
          </div>
          <div className="italic mb-4">Set the token ID of your NFT</div>
          <div>
            <InputNumber
              className="py-2 mb-3 text-base"
              disabled={approveNFTLoading}
              min={0}
              step="1"
              value={tokenId}
              placeholder="Token ID"
              stringMode
              status={tokenIdError}
              prefix={
                tokenIdError && (
                  <ExclamationCircleTwoTone twoToneColor="#f5222d" />
                )
              }
              onChange={handleTokenIdChange}
            />
            {tokenIdError && <div className="text-red-700">{tokenIdError}</div>}
          </div>
          <Button
            className="mt-3 mb-10"
            type="primary"
            disabled={!tokenId || !enableApproveBtn || approveNFTLoading}
            loading={approveNFTLoading}
            onClick={(e) => handleSubmit(e, 'approval')}
          >
            Approve to List
          </Button>
          {/* Price input */}
          <div className="font-bold text-xl mb-2">
            2. Set a Price & List Item
          </div>
          <div className="italic mb-4">Set the selling price of your NFT</div>
          <div>
            <InputNumber
              className="py-2 mb-3 text-base"
              addonAfter="ETH"
              disabled={!tokenId && !nftApproved}
              min={0}
              step="0.01"
              value={listingPrice}
              placeholder="Set NFT price"
              stringMode
              status={nftApproved && priceError}
              prefix={
                nftApproved &&
                priceError && (
                  <ExclamationCircleTwoTone twoToneColor="#f5222d" />
                )
              }
              onChange={handlePriceChange}
            />
            {nftApproved && priceError && (
              <div className="text-red-700">{priceError}</div>
            )}
          </div>
          <Button
            className="mt-3"
            type="primary"
            disabled={
              !listingPrice ||
              // !nftApproved ||
              listItemLoading ||
              !enableListingBtn
            }
            loading={listItemLoading}
            onClick={(e) => handleSubmit(e, 'listing')}
          >
            List Item
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <p className="font-bold text-xl text-center pt-20 pb-10">
            Connect a wallet to list your NFT
          </p>
          <ConnectButton />
        </div>
      )}
    </div>
  );
};

export default ListNFT;
