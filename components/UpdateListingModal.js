import { Modal, InputNumber, Button, notification } from 'antd';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';
import { useState } from 'react';
import contractUtils from '../utils/contract';
import marketplaceAbi from '../constants/marketplaceAbi.json';
import { ethers } from 'ethers';

const UpdateListingModal = ({
  isVisible,
  hideModal: hideUpdateModal,
  nftAddress,
  marketplaceAddress,
  tokenId,
  price,
}) => {
  setTwoToneColor('#4D21FC');

  const [enableUpdateBtn, setEnableUpdateBtn] = useState(false);
  const [listingPrice, setListingPrice] = useState(price);
  const [priceError, setPriceError] = useState('');
  const [updateError, setUpdateError] = useState('');

  const handleInputChange = (value) => {
    if (!value) {
      setPriceError('Item price can not be empty!');
      enableUpdateBtn && setEnableUpdateBtn(false);
    } else if (value === '0') {
      setPriceError('Item price must be greater than 0');
      enableUpdateBtn && setEnableUpdateBtn(false);
    } else if (value === price) {
      setPriceError('New price is the same as original price');
      enableUpdateBtn && setEnableUpdateBtn(false);
    } else {
      priceError && setPriceError('');
      setEnableUpdateBtn(true);
    }

    setListingPrice(value);
  };

  const handleSuccess = async (tx) => {
    hideUpdateModal();

    notification.info({
      message: 'Updating listing price...',
      description: 'Transaction is pending, please wait.',
    });

    try {
      await tx.wait(1);

      notification.success({
        message: 'Transaction Confirmed!',
        description: `Price of PixCat #${tokenId} updated! Please refresh page.`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleError = (error) => {
    setListingPrice(price);
    hideUpdateModal();

    const { code, message: errMsg } = error;

    if (code && code === 'ACTION_REJECTED') {
      setUpdateError('User rejected transaction!');
      return;
    }

    if (message) {
      setUpdateError(errMsg);
      return;
    }

    setUpdateError(JSON.stringify(error));
  };

  const handleCancelUpdate = () => {
    setListingPrice(price);
    hideUpdateModal();
  };

  const { write: updateListing } = contractUtils.write({
    abi: marketplaceAbi,
    address: marketplaceAddress,
    functionName: 'updateListing',
    params: [nftAddress, tokenId, ethers.utils.parseEther(listingPrice)],
    onSuccess: handleSuccess,
    onError: handleError,
    enabled: listingPrice !== price,
  });

  const modalTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleTwoTone className="mr-2" style={{ fontSize: '18px' }} />
      Update Listing Price
    </div>
  );

  const errorTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleTwoTone className="mr-2" style={{ fontSize: '18px' }} />
      Error Updating Listing Price
    </div>
  );

  return updateError ? (
    <Modal
      open={true}
      centered
      title={errorTitle}
      closable={false}
      footer={[
        <Button key="back" type="primary" onClick={() => setUpdateError('')}>
          OK
        </Button>,
      ]}
    >
      {updateError}
    </Modal>
  ) : (
    <Modal
      open={isVisible}
      centered
      title={modalTitle}
      closable={false}
      destroyOnClose={true}
      footer={[
        <Button key="back" onClick={handleCancelUpdate}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!enableUpdateBtn}
          onClick={updateListing}
        >
          Update
        </Button>,
      ]}
    >
      <InputNumber
        className="py-2 text-base"
        addonAfter="ETH"
        min={0}
        defaultValue={price}
        value={listingPrice}
        step="0.01"
        stringMode
        status={priceError && 'error'}
        prefix={
          priceError && <ExclamationCircleTwoTone twoToneColor="#f5222d" />
        }
        onChange={handleInputChange}
      />
      {priceError && <div className="text-red-700">{priceError}</div>}
    </Modal>
  );
};

export default UpdateListingModal;
