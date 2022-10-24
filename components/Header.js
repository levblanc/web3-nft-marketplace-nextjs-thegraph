import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <nav className="px-5 py-3 border-b border-slate-200 flex flex-row justify-between items-center">
      <div className="flex flex-row items-center">
        <h1 className="font-bold text-3xl mr-8 mb-1">NFT Marketplace</h1>
        <div className="flex flex-row items-center text-lg">
          <Link href="/">
            <a className="mr-4 p-5">Home</a>
          </Link>
          <Link href="/mint-nft">
            <a className="mr-4 p-5">Mint NFT</a>
          </Link>
        </div>
      </div>
      <ConnectButton
        showNetwork
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
        chainStatus={{
          smallScreen: 'icon',
          largeScreen: 'full',
        }}
      />
    </nav>
  );
};

export default Header;
