import { ConnectButton } from '@rainbow-me/rainbowkit';

const ConnectTips = ({ tips }) => {
  return (
    <div className="tipsBox w-4/5">
      <p className="font-bold text-xl text-center mb-10">{tips}</p>
      <ConnectButton />
    </div>
  );
};

export default ConnectTips;
