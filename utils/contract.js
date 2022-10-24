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

const write = ({
  abi,
  address,
  functionName,
  params,
  onSuccess,
  onError,
  enabled,
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { config, error: prepareWriteError } = usePrepareContractWrite({
    abi,
    address,
    functionName,
    args: params,
    enabled,
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useContractWrite({
    ...config,
    onSuccess,
    onError,
    enabled,
  });
};

const contract = { read, write };

export default contract;
