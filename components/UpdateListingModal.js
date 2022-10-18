import { Modal, InputNumber } from 'antd';

const UpdateListingModal = ({ open, nftAdress, tokenId, price }) => {
  return (
    <Modal
      className="text-lg"
      open={open}
      centered
      title="Update listing price"
      okText="Update"
    >
      <InputNumber addonAfter="ETH" defaultValue={price} />
    </Modal>
  );
};

export default UpdateListingModal;
