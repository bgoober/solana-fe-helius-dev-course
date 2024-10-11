// imports methods relevant to the react framework
import * as React from "react";
// library we use to interact with the solana json rpc api
import * as web3 from "@solana/web3.js";
// allows us access to methods and components which give us access to the solana json rpc api and user's wallet data
import * as walletAdapterReact from "@solana/wallet-adapter-react";
// allows us to choose from the available wallets supported by the wallet adapter
import * as walletAdapterWallets from "@solana/wallet-adapter-wallets";
// imports a component which can be rendered in the browser
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
// applies the styling to the components which are rendered on the browser
require("@solana/wallet-adapter-react-ui/styles.css");
// imports methods for deriving data from the wallet's data store
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const Starter = () => {
  // lets us add the wallet's account balance to the component
  const [balance, setBalance] = React.useState<number | null>(0);

  // specify the network to use
  const endpoint = web3.clusterApiUrl("devnet");

  // specify which wallets we want the adapater to support
  const wallets = [new walletAdapterWallets.PhantomWalletAdapter(),
    new walletAdapterWallets.BitKeepWalletAdapter(),
    new walletAdapterWallets.LedgerWalletAdapter(),
    new walletAdapterWallets.SolflareWalletAdapter()
  ];

  // connection context object that is injected into the browser by the wallet
  const { connection } = useConnection();

  // publicKey context object to use the connected wallet and the pubkey within
  const { publicKey } = useWallet();

  //
  React.useEffect(() => {
    const getInfo = async () => {
      // if there is both a connection and publicKey, continue
      if (connection && publicKey) {
        // create a info object from the account info of the publicKey through our connection object
        const info = await connection.getAccountInfo(publicKey);
        // store in our app's state the info! lamports in terms of whole SOL using the setBalance function
        setBalance(info!.lamports / web3.LAMPORTS_PER_SOL);
      }
    };
    getInfo();
    // the [connection, publicKey] means our app will update any time these values change on the front end
  }, [connection, publicKey]);

  return (
    <>
        {/* provides a connection to the solana json rpc api */}
        <walletAdapterReact.ConnectionProvider endpoint={endpoint}>
            {/* makes the wallet adapter available to the entirety of our application (wrapped in this component) */}
            <walletAdapterReact.WalletProvider wallets={wallets}>
                {/* provides components to the wrapped application */}
                <WalletModalProvider>
                    <main className='min-h-screen text-white'>
                        <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 p-4'>
                            <div className='col-span-1 lg:col-start-2 lg:col-end-4 rounded-lg bg-[#2a302f] h-60 p-4'>
                                <div className='flex justify-between items-center'>
                                    <h2 className='text-3xl font-semibold'>
                                        account info ✨
                                    </h2>
                                    {/* button component for connecting to solana wallet */}
                                    <WalletMultiButton
                                        className='!bg-helius-orange !rounded-xl hover:!bg-[#161b19] transition-all duration-200'
                                    />
                                </div>

                                <div className='mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2'>
                                    <ul className='p-2'>
                                        <li className='flex justify-between'>
                                            <p className='tracking-wider'>Wallet is connected...</p>
                                            <p className='text-helius-orange italic font-semibold'>
                                                {publicKey ? 'yes' : 'no'}
                                            </p>
                                        </li>
                                        
                                        <li className='text-sm mt-4 flex justify-between'>
                                            <p className='tracking-wider'>Balance...</p>
                                            <p className='text-helius-orange italic font-semibold'>
                                                {balance}
                                            </p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </main>
                </WalletModalProvider>
            </walletAdapterReact.WalletProvider>
        </walletAdapterReact.ConnectionProvider>
    </>
);
};

export default Starter;