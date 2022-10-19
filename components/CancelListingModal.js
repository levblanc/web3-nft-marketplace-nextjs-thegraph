import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const CancelListingModal = ({ isVisible, hideModal, nftAddress, tokenId }) => {
  const modalTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleOutlined className="mr-2" />
      Confrim cancel listing
    </div>
  );

  return (
    <Modal
      open={isVisible}
      centered
      title={modalTitle}
      okText="Confirm"
      cancelText="Cancel"
      onCancel={hideModal}
      onClose={hideModal}
      onOk={''}
      confirmLoading={''}
    >
      <p className="py-5 text-base">
        Please confirm to cancel item PixCat #{tokenId}
      </p>
    </Modal>
  );
};

export default CancelListingModal;
