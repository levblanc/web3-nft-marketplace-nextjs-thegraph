import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <nav className="px-5 flex flex-row justify-between items-center">
      <div className="flex flex-row items-center">
        <h1 className="appName font-bold text-2xl mr-8 mb-1">
          NFT Marketplace
        </h1>
        <div className="flex flex-row items-center text-lg">
          <Link href="/">
            <a className="navLink mr-4 p-4">Home</a>
          </Link>
          <Link href="/mint-nft">
            <a className="navLink mr-4 p-4">Mint NFT</a>
          </Link>
          <Link href="/list-nft">
            <a className="navLink mr-4 p-4">List NFT</a>
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
