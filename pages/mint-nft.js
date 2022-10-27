import { Modal, Button, notification } from 'antd';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useProvider } from 'wagmi';
import Link from 'next/link';
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

  const handleMintSuccess = async (tx) => {
    notification.info({
      message: 'Minting NFT...',
      description: 'Transaction is pending, please wait.',
    });

    try {
      const { transactionHash } = await tx.wait(1);

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
        style={{ fontSize: '18px' }}
        twoToneColor="#f5222d"
      />
      Error Minting NFT
    </div>
  );

  return (
    <div className="container mx-auto">
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
          <>
            <h1 className="pageTitle mt-10 mb-16 font-bold text-2xl">
              Mint your NFT
            </h1>
            <div className="">
              {/* Pick target NFT number */}
              <div className="instructionTitle font-bold text-xl mb-2">
                Pick a number
              </div>
              <div className="instructionDesc italic mb-5">
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
            </div>
            {/* Instructions to get token ID & list NFT */}
            {txHash && (
              <>
                <p className="text-lg mb-3">
                  NFT minted! Transaction hash is {txHash}
                </p>
                <p>
                  1.{' '}
                  <Link
                    href={`https://goerli.etherscan.io/tx/${txHash}`}
                    target="_blank"
                  >
                    <a className="text-base italic my-5">
                      Check your token ID on goerli.etherscan.io
                    </a>
                  </Link>
                </p>
                <p>
                  2.{' '}
                  <Link href="/list-nft">
                    <a className="text-base italic my-5">
                      List & Sell your NFT now!
                    </a>
                  </Link>
                </p>
              </>
            )}
          </>
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
