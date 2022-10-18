export const truncateAddress = (address) => {
  if (!address) {
    console.log(`>>>>>> Address is ${address}`);
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
