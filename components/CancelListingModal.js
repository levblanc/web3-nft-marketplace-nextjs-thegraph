import { Modal } from 'antd';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';

const CancelListingModal = ({ isVisible, hideModal, nftAddress, tokenId }) => {
  setTwoToneColor('#faad14');

  const modalTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleTwoTone className="mr-2" style={{ fontSize: '20px' }} />
      Confrim Remove Item
    </div>
  );

  return (
    <Modal
      open={isVisible}
      centered
      title={modalTitle}
      closable={false}
      okType="danger"
      okText="Confirm"
      cancelText="Cancel"
      onOk={''}
      confirmLoading={''}
      onCancel={hideModal}
    >
      <p className="py-5 text-base">
        Please confirm to remove item PixCat #{tokenId} from listing
      </p>
    </Modal>
  );
};

export default CancelListingModal;
