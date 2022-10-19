import { Modal, Button } from 'antd';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';
import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from 'react-moralis';
import { useEffect, useState } from 'react';

const BuyItemModal = ({
  isVisible,
  hideModal,
  chain,
  userAccount,
  nftAddress,
  tokenId,
  price,
}) => {
  const web3Api = useMoralisWeb3Api();

  setTwoToneColor('#faad14');

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

  const [accountBalance, setAccountBalance] = useState(0);
  const [isBalanceEnough, setIsBalanceEnough] = useState(true);

  const chainStr = chainMapping[chain];

  const {
    data: account,
    error,
    isLoading,
  } = useMoralisWeb3ApiCall(web3Api.account.getNativeBalance, {
    chain: chain,
    address: userAccount,
  });

  useEffect(() => {
    // console.log('isLoading', isLoading);
    // console.log('account', account);
    // console.log('error', error);
    // setAccountBalance(account.balance);

    if (price > accountBalance) {
      setIsBalanceEnough(false);
    } else {
      setIsBalanceEnough(true);
    }
  }, [price, accountBalance]);

  return isBalanceEnough ? (
    <Modal
      open={isVisible && isBalanceEnough}
      centered
      title={buyItemModalTitle}
      closable={false}
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
      <p className="py-5 text-base">NFT item you are going to buy:</p>
      <p className="py-5 text-base font-bold">PixCat #{tokenId}</p>
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
