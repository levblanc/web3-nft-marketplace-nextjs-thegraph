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
  const [listingPrice, setListingPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const [enableMintBtn, setEnableMintBtn] = useState(true);
  const [mintError, setMintError] = useState(false);
  const [tokenID, setTokenID] = useState(null);

  const handleInputChange = (value) => {
    if (!value) {
      setPriceError('Item price can not be empty!');
      enableMintBtn && setEnableMintBtn(false);
    } else if (value === '0') {
      setPriceError('Item price must be greater than 0');
      enableMintBtn && setEnableMintBtn(false);
    } else {
      priceError && setPriceError('');
      setEnableMintBtn(true);
    }

    setListingPrice(value);
  };

  const handleMintSuccess = async (tx) => {
    notification.info({
      message: 'Minting NFT...',
      description: 'Transaction is pending, please wait.',
    });

    try {
      const txReceipt = await tx.wait(1);
      const { tokenId } = txReceipt.events[0].args;
      setTokenID(tokenId);

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

  const { write: mintNFT } = contractUtils.write({
    abi: dynamicNFTAbi,
    address: dynamicNFTAddress,
    functionName: 'mintNFT',
    params: [targetNum],
    onSuccess: handleMintSuccess,
    onError: handleError,
  });

  const { write: approveNFT } = contractUtils.write({
    abi: dynamicNFTAbi,
    address: dynamicNFTAddress,
    functionName: 'approve',
    params: [marketplaceAddress, tokenID],
    onSuccess: handleApprovalSuccess,
    onError: handleError,
  });

  const { write: listItem } = contractUtils.write({
    abi: marketplaceAbi,
    address: marketplaceAddress,
    functionName: 'listItem',
    params: [dynamicNFTAddress, tokenID, ethers.utils.parseEther(listingPrice)],
    params: [],
    onSuccess: handleListingSuccess,
    onError: handleError,
  });

  const handleMintAndList = async () => {
    try {
      await mintNFT();
      try {
        await approveNFT();
        try {
          await listItem();
        } catch (listItemError) {
          console.error('List item error', listItemError);
        }
      } catch (approvalError) {
        console.error('Approve NFT error', approvalError);
      }
    } catch (mintNftError) {
      console.error('Mint NFT error', mintNftError);
    }
  };

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
            <h1 className="my-10 font-bold text-2xl">Mint and List your NFT</h1>
            <div className="">
              {/* Pick target NFT number */}
              <div className="font-bold text-xl mb-2">Pick a number</div>
              <div className="italic mb-5">
                Your NFT will be different based on the number you choose
              </div>
              <div className="mt-5 mb-10">{numberButtons}</div>
              {/* Price input */}
              <div className="font-bold text-xl mb-2">Set a price</div>
              <div className="italic mb-4">
                Set the selling price of your NFT
              </div>
              <div>
                <InputNumber
                  className="py-2 text-base"
                  addonAfter="ETH"
                  min={0}
                  step="0.01"
                  value={listingPrice}
                  placeholder="Set NFT price"
                  stringMode
                  status={priceError && 'error'}
                  prefix={
                    priceError && (
                      <ExclamationCircleTwoTone twoToneColor="#f5222d" />
                    )
                  }
                  onChange={handleInputChange}
                />
                {priceError && <div className="text-red-700">{priceError}</div>}
              </div>
              {/* Mint NFT Button */}
              <Button
                type="primary"
                className="font-bold text-xl my-10"
                disabled={!enableMintBtn || !targetNum || !listingPrice}
                onClick={handleMintAndList}
              >
                Mint & List to Marketplace
              </Button>
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
