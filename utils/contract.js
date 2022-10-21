import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';

const read = ({ abi, address, functionName, params, enabled }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useContractRead({
    abi,
    address,
    functionName,
    args: params,
    enabled,
  });
};

const write = ({ abi, address, functionName, params, onSuccess, onError }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { config, error: prepareWriteError } = usePrepareContractWrite({
    abi,
    address,
    functionName,
    args: params,
  });

  const {
    data: writeResponse,
    write,
    isLoading: isWriteLoading,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useContractWrite({
    ...config,
    onSuccess,
    onError,
  });

  console.log('isWriteLoading', isWriteLoading);
  console.log('writeResponse', writeResponse);

  const {
    isLoading: isConfirmationLoading,
    isSuccess: isConfirmationSuccess,
    data: confirmationReceipt,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useWaitForTransaction({
    hash: writeResponse && writeResponse.hash,
    confirmations: 1,
  });

  console.log('isConfirmationLoading', isConfirmationLoading);
  console.log('isConfirmationSuccess', isConfirmationSuccess);
  console.log('confirmationReceipt', confirmationReceipt);

  return {
    write,
    isWriteLoading,
    isConfirmationLoading,
    isConfirmationSuccess,
    confirmationReceipt,
  };
};

const contract = { read, write };

export default contract;
