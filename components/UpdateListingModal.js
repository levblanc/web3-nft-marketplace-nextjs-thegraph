import { Modal, InputNumber } from 'antd';
import { ExclamationCircleTwoTone, setTwoToneColor } from '@ant-design/icons';

const UpdateListingModal = ({
  isVisible,
  hideModal,
  nftAdress,
  tokenId,
  price,
}) => {
  setTwoToneColor('#096dd9');

  const modalTitle = (
    <div className="flex flex-row items-center">
      <ExclamationCircleTwoTone className="mr-2" style={{ fontSize: '20px' }} />
      Update Listing Price
    </div>
  );

  return (
    <Modal
      open={isVisible}
      centered
      title={modalTitle}
      closable={false}
      okText="Update"
      onOk={''}
      confirmLoading={''}
      onCancel={hideModal}
    >
      <InputNumber
        className="py-2 text-base"
        addonAfter="ETH"
        defaultValue={price}
        step="0.01"
        stringMode
      />
    </Modal>
  );
};

export default UpdateListingModal;
