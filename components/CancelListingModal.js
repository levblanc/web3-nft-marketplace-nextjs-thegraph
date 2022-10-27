import { Modal, Button, notification } from 'antd';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';
import contractUtils from '../utils/contract';
import marketplaceAbi from '../constants/marketplaceAbi.json';
import { useState } from 'react';

const CancelListingModal = ({
  isVisible,
  hideModal,
  marketplaceAddress,
  nftAddress,
  tokenId,
}) => {
  setTwoToneColor('#EC3A37F5');

  const [cancelError, setCancelError] = useState('');

  const handleSuccess = async (tx) => {
    hideModal();

    notification.info({
      message: 'Canceling item listing...',
      description: 'Transaction is pending, please wait.',
    });

    try {
      await tx.wait(1);

      notification.success({
        message: 'Transaction Confirmed!',
        description: `Price of PixCat #${tokenId} removed from listing! Please refresh page.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleError = (error) => {
    hideModal();

    const { code, message: errMsg } = error;

    if (code && code === 'ACTION_REJECTED') {
      setCancelError('User rejected transaction!');
      return;
    }

    if (message) {
      setCancelError(errMsg);
      return;
    }

    setCancelError(JSON.stringify(error));
  };

  const { write: cancelListing } = contractUtils.write({
    abi: marketplaceAbi,
    address: marketplaceAddress,
    functionName: 'cancelListing',
    params: [nftAddress, tokenId],
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const modalTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleTwoTone className="mr-2" style={{ fontSize: '18px' }} />
      Confrim Remove Item
    </div>
  );

  const errorTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleTwoTone className="mr-2" style={{ fontSize: '18px' }} />
      Error Canceling Item Listing
    </div>
  );

  return (
    <>
      {cancelError ? (
        <Modal
          open={true}
          centered
          title={errorTitle}
          closable={false}
          footer={[
            <Button
              key="back"
              type="primary"
              onClick={() => setCancelError('')}
            >
              OK
            </Button>,
          ]}
        >
          {cancelError}
        </Modal>
      ) : (
        <Modal
          open={isVisible}
          centered
          title={modalTitle}
          closable={false}
          footer={[
            <Button key="back" onClick={hideModal}>
              Cancel
            </Button>,
            <Button key="confirm" type="primary" danger onClick={cancelListing}>
              Confirm
            </Button>,
          ]}
        >
          <p className="py-5 text-base text-[#A599E9]">
            Please confirm to
            <span className="font-bold text-[#EC3A37F5]">{' remove '}</span>
            item PixCat #{tokenId} from listing
          </p>
        </Modal>
      )}
    </>
  );
};

export default CancelListingModal;
