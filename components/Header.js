import Link from 'next/link';
import { ConnectButton } from '@web3uikit/web3';

const Header = () => {
  return (
    <nav className="px-5 py-3 border-b border-slate-200 flex flex-row justify-between items-center">
      <h1 className="h-3 leading-3 font-bold text-3xl">NFT Marketplace</h1>
      <div className="flex flex-row items-center text-lg">
        <Link href="/">
          <a className="mr-4 p-5">Home</a>
        </Link>
        <Link href="/sell-nft">
          <a className="mr-4 p-5">Sell NFT</a>
        </Link>
        <ConnectButton moralisAuth={false} />
      </div>
    </nav>
  );
};

export default Header;
