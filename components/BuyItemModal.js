import { Modal, Button } from 'antd';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useBalance } from 'wagmi';

const BuyItemModal = ({
  isVisible,
  hideModal,
  chain,
  userAccount,
  nftAddress,
  tokenId,
  price,
}) => {
  setTwoToneColor('#096dd9');

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

  const [isBalanceEnough, setIsBalanceEnough] = useState(false);
  let accountBalance = 0;

  const { data: accountData, error: useBalanceError } = useBalance({
    addressOrName: userAccount,
  });

  if (useBalanceError) {
    console.error(`Get account balance error: ${useBalanceError}`);
  }

  accountData && (accountBalance = accountData.formatted);

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
    <Modal
      open={isVisible && isBalanceEnough}
      centered
      title={buyItemModalTitle}
      onCancel={hideModal}
      footer={[
        <Button
          key="submit"
          type="primary"
          // loading={loading}
          onClick={''}
        >
          Buy Now
        </Button>,
      ]}
    >
      <p className="py-5 text-base">
        NFT item you are going to buy:
        <span className="py-5 text-base font-bold">{` PixCat #${tokenId}`}</span>
      </p>
    </Modal>
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
