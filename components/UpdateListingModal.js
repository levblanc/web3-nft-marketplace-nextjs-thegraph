import { Modal, InputNumber } from 'antd';

const UpdateListingModal = ({
  isVisible,
  hideModal,
  nftAdress,
  tokenId,
  price,
}) => {
  return (
    <Modal
      open={isVisible}
      centered
      title="Update listing price"
      okText="Update"
      onCancel={hideModal}
      onClose={hideModal}
      onOk={''}
      confirmLoading={''}
    >
      <InputNumber
        className="py-2 text-base"
        addonAfter="ETH"
        defaultValue={price}
      />
    </Modal>
  );
};

export default UpdateListingModal;
