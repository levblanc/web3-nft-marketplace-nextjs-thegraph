import { Modal, InputNumber, Button, notification } from 'antd';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useProvider } from 'wagmi';
import { useState } from 'react';
import { ethers } from 'ethers';
import contractAddresses from '../constants/contractAddresses.json';
import dynamicNFTAbi from '../constants/dynamicNFTAbi.json';
import marketplaceAbi from '../constants/marketplaceAbi.json';
import contractUtils from '../utils/contract';

const MintNFT = () => {
  const {
    network: { chainId },
  } = useProvider();
  const { isDisconnected } = useAccount();
  const chain = chainId ? parseInt(chainId) : 31337;
  const marketplaceAddress = contractAddresses[chain].NFTMarketplace;
  const dynamicNFTAddress = contractAddresses[chain].DynamicNFT;

  const [targetNum, setTargetNum] = useState(null);
  const [enableMintBtn, setEnableMintBtn] = useState(true);
  const [mintError, setMintError] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [tokenId, setTokenId] = useState('');
  const [tokenIdError, setTokenIdError] = useState('');
  const [enableApproveBtn, setEnableApproveBtn] = useState(true);
  const [nftApproved, setNftApproved] = useState(false);
  const [listingPrice, setListingPrice] = useState('');
  const [priceInEther, setPriceInEther] = useState(listingPrice);
  const [priceError, setPriceError] = useState('');
  const [enableListingBtn, setEnableListingBtn] = useState(false);

  const handleTokenIdChange = (value) => {
    if (!value) {
      setPriceError('Token ID can not be empty!');
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
    setPriceInEther(ethers.utils.parseEther(value));
  };

  const handleMintSuccess = async (tx) => {
    notification.info({
      message: 'Minting NFT...',
      description: 'Transaction is pending, please wait.',
    });

    try {
      const { transactionHash } = await tx.wait(1);

      console.log('Tx Hash', transactionHash);

      setTxHash(transactionHash);
      setTargetNum(null);

      notification.success({
        message: 'Transaction Confirmed!',
        description: `NFT minted!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprovalSuccess = async (tx) => {
    notification.info({
      message: 'Approving NFT...',
      description: 'Transaction is pending, please wait.',
    });

    try {
      await tx.wait(1);

      setNftApproved(true);
      setTokenId('');

      notification.success({
        message: 'Transaction Confirmed!',
        description: `NFT approved!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleListingSuccess = async (tx) => {
    notification.info({
      message: 'Listing NFT...',
      description: 'Transaction is pending, please wait.',
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
      setMintError('User rejected transaction!');
      return;
    }

    if (message) {
      setMintError(errMsg);
      return;
    }

    setMintError(JSON.stringify(error));
  };

  const { write: mintNFT, isLoading: mintNFTLoading } = contractUtils.write({
    abi: dynamicNFTAbi,
    address: dynamicNFTAddress,
    functionName: 'mintNFT',
    params: [targetNum],
    onSuccess: handleMintSuccess,
    onError: handleError,
    enabled: targetNum,
  });

  const { write: approveNFT, isLoading: approveNFTLoading } =
    contractUtils.write({
      abi: dynamicNFTAbi,
      address: dynamicNFTAddress,
      functionName: 'approve',
      params: [marketplaceAddress, tokenId],
      onSuccess: handleApprovalSuccess,
      onError: handleError,
      enabled: tokenId,
    });

  const { write: listItem, isLoading: listItemLoading } = contractUtils.write({
    abi: marketplaceAbi,
    address: marketplaceAddress,
    functionName: 'listItem',
    params: [dynamicNFTAddress, tokenId, priceInEther],
    onSuccess: handleListingSuccess,
    onError: handleError,
    enabled: tokenId && listingPrice,
  });

  let numberButtons = [];

  for (let num = 1; num <= 6; num++) {
    numberButtons.push(
      <Button
        className="mr-3 text-lg"
        key={num}
        type={num === targetNum ? 'primary' : ''}
        onClick={() => setTargetNum(num)}
      >
        {num}
      </Button>
    );
  }

  const errorTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleTwoTone
        className="mr-2"
        style={{ fontSize: '20px' }}
        twoToneColor="#f5222d"
      />
      Error Minting NFT
    </div>
  );

  return (
    <div className="container mx-auto text-slate-800">
      {!isDisconnected ? (
        mintError ? (
          <Modal
            open={true}
            centered
            title={errorTitle}
            closable={false}
            footer={[
              <Button
                key="back"
                type="primary"
                onClick={() => setMintError('')}
              >
                OK
              </Button>,
            ]}
          >
            {mintError}
          </Modal>
        ) : (
          <div>
            <h1 className="my-10 font-bold text-2xl">
              Mint and List your NFT to Marketplace
            </h1>
            <div className="">
              {/* Pick target NFT number */}
              <div className="font-bold text-xl mb-2">Pick a number</div>
              <div className="italic mb-5">
                Your NFT will be different based on the number you choose
              </div>
              <div className="mb-3">{numberButtons}</div>
              {/* Mint NFT Button */}
              <Button
                type="primary"
                className="font-bold text-xl mt-5 mb-10"
                disabled={!enableMintBtn || !targetNum || mintNFTLoading}
                loading={mintNFTLoading}
                onClick={mintNFT}
              >
                Mint NFT
              </Button>
              {/* List to Marketplace */}
              {txHash && (
                <>
                  <p className="text-lg mb-3">
                    NFT minted! Transaction hash is {txHash}
                  </p>
                  <p className="text-base italic mb-10">
                    Follow instructions below to list your NFT or{' '}
                    <a href={`https://goerli.etherscan.io/tx/${txHash}`}>
                      check it on goerli.etherscan.io
                    </a>
                  </p>
                  {/* Approve for Marketplace to sell the NFT */}
                  <div className="font-bold text-xl mb-2">
                    Approve Marketplace to List your NFT
                  </div>
                  <div className="italic mb-4">
                    Set the token ID of your NFT
                  </div>
                  <div>
                    <InputNumber
                      className="py-2 mb-3 text-base"
                      disabled={!txHash || approveNFTLoading}
                      min={0}
                      step="1"
                      value={tokenId}
                      placeholder="Set token ID"
                      stringMode
                      status={tokenIdError}
                      prefix={
                        tokenIdError && (
                          <ExclamationCircleTwoTone twoToneColor="#f5222d" />
                        )
                      }
                      onChange={handleTokenIdChange}
                    />
                    {tokenIdError && (
                      <div className="text-red-700">{tokenIdError}</div>
                    )}
                  </div>
                  <Button
                    className="mt-3 mb-10"
                    type="primary"
                    disabled={
                      !tokenId || !enableApproveBtn || approveNFTLoading
                    }
                    loading={approveNFTLoading}
                    onClick={approveNFT}
                  >
                    Approve to List
                  </Button>
                  {/* Price input */}
                  <div className="font-bold text-xl mb-2">
                    Set a Price & List Item
                  </div>
                  <div className="italic mb-4">
                    Set the selling price of your NFT
                  </div>
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
                      !nftApproved ||
                      listItemLoading ||
                      !enableListingBtn
                    }
                    loading={listItemLoading}
                    onClick={listItem}
                  >
                    List Item
                  </Button>
                </>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center">
          <p className="font-bold text-xl text-center pt-20 pb-10">
            Connect a wallet to mint your NFT
          </p>
          <ConnectButton />
        </div>
      )}
    </div>
  );
};

export default MintNFT;
