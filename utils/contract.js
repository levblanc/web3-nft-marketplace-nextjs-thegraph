import { useContractRead } from 'wagmi';

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

const contract = { read };

export default contract;
