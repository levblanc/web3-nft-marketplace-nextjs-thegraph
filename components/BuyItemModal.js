import { Modal, Button, notification } from 'antd';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useBalance } from 'wagmi';
import { ethers } from 'ethers';
import contractUtils from '../utils/contract';
import marketplaceAbi from '../constants/marketplaceAbi.json';

const BuyItemModal = ({
  isVisible,
  hideModal,
  chain,
  userAccount,
  nftAddress,
  marketplaceAddress,
  tokenId,
  price,
}) => {
  setTwoToneColor('#096dd9');

  const [isBalanceEnough, setIsBalanceEnough] = useState(false);
  const [buyItemError, setBuyItemError] = useState('');
  const { data: accountData, error: useBalanceError } = useBalance({
    addressOrName: userAccount,
  });

  let accountBalance = 0;

  if (useBalanceError) {
    console.error('Get account balance error', useBalanceError);
  }

  accountData && (accountBalance = accountData.formatted);

  const handleSuccess = async (tx) => {
    hideModal();

    notification.info({
      message: 'Buying item...',
      description: 'Transaction is pending, please wait.',
    });

    try {
      await tx.wait(1);

      notification.success({
        message: 'Transaction Confirmed!',
        description: `PixCat #${tokenId} is now yours! Please refresh page.`,
      });
    } catch (error) {
      console.log('buy item error!!!', error);
      handleError(error);
    }
  };

  const handleError = (error) => {
    hideModal();

    const { code, message: errMsg } = error;

    if (code && code === 'ACTION_REJECTED') {
      setBuyItemError('User rejected transaction!');
      return;
    }

    if (message) {
      setBuyItemError(errMsg);
      return;
    }

    setBuyItemError(JSON.stringify(error));
  };

  const { write: buyItem } = contractUtils.write({
    abi: marketplaceAbi,
    address: marketplaceAddress,
    functionName: 'buyItem',
    params: [nftAddress, tokenId, { value: ethers.utils.parseEther(price) }],
    onSuccess: handleSuccess,
    onError: handleError,
    enabled: nftAddress && tokenId && price,
  });

  const buyItemModalTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleTwoTone className="mr-2" style={{ fontSize: '20px' }} />
      Confrim order
    </div>
  );

  const balanceNotEnoughModalTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleTwoTone className="mr-2" style={{ fontSize: '20px' }} />
      Balance Not Enough
    </div>
  );

  const errorTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleTwoTone
        className="mr-2"
        style={{ fontSize: '20px' }}
        twoToneColor="#cf1322"
      />
      Error Updating Listing Price
    </div>
  );

  useEffect(() => {
    if (accountBalance) {
      if (price > accountBalance) {
        setIsBalanceEnough(false);
      } else {
        setIsBalanceEnough(true);
      }
    }
  }, [userAccount, accountBalance]);

  return isBalanceEnough ? (
    buyItemError ? (
      <Modal
        open={true}
        centered
        title={errorTitle}
        closable={false}
        footer={[
          <Button key="back" type="primary" onClick={() => setBuyItemError('')}>
            OK
          </Button>,
        ]}
      >
        {buyItemError}
      </Modal>
    ) : (
      <Modal
        open={isVisible && isBalanceEnough}
        centered
        title={buyItemModalTitle}
        onCancel={hideModal}
        footer={[
          <Button key="submit" type="primary" onClick={buyItem}>
            Buy Now
          </Button>,
        ]}
      >
        <p className="py-5 text-base">
          NFT item you are going to buy:
          <span className="py-5 text-base font-bold">{` PixCat #${tokenId}`}</span>
        </p>
      </Modal>
    )
  ) : (
    <Modal
      open={isVisible && !isBalanceEnough}
      centered
      title={balanceNotEnoughModalTitle}
      closable={false}
      footer={[
        <Button key="back" onClick={hideModal}>
          OK
        </Button>,
      ]}
    >
      <p className="py-5 text-base">Your balance is not enough!</p>
    </Modal>
  );
};

export default BuyItemModal;
