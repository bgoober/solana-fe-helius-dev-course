import React, { useState, useEffect } from "react";
import * as web3 from "@solana/web3.js";
import { toast } from "react-toastify";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ExternalLinkIcon } from "@heroicons/react/outline";

const Finished = () => {
  // create several react hooks to create and set state objects

  // account, set to blank string
  const [account, setAccount] = useState("");

  // amount, set to 0
  const [amount, setAmount] = useState(0);

  // balance, set to 0
  const [balance, setBalance] = useState(0);

  // transaction signature, set to blank string
  const [txSig, setTxSig] = useState("");

  // use connection from solana wallet adapter
  const { connection } = useConnection();

  // use public key and send transaction from solana wallet adapter
  const { publicKey, sendTransaction } = useWallet();

  // transaction handler function, asynchronous
  const handleTransaction = async () => {
    // if no connection or publicKey from the wallet adapter, toast an error
    if (!connection || !publicKey) {
      toast.error("Please connect your wallet!");
      return;
    }

    // else, start creating objects for a transaction
    const transaction = new web3.Transaction();

    // we need to retrieve the latest blockhash to include in the transaction; this getLatestBlockhash method is the updated method
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    // create transfer instruction
    const instruction = web3.SystemProgram.transfer({
      fromPubkey: publicKey,
      lamports: amount * web3.LAMPORTS_PER_SOL,
      toPubkey: account,
    });

    // add the instruction to the transaction object
    transaction.add(instruction);

    //
    try {
      const signature = await sendTransaction(transaction, connection);
      setTxSig(signature);

      const newBalance = balance - amount;
      setBalance(newBalance);
    } catch (error) {
      console.log(error);
      toast.error("Transaction failed!");
    } finally {
      setAccount("");
      setAmount(0);
      document.getElementById("account").value = "";
      document.getElementById("amount").value = "";
    }
  };

  // react hook that says: whenever the user connects their wallet, from the code block
  useEffect(() => {
    const getInfo = async () => {
      if (connection && publicKey) {
        const info = await connection.getAccountInfo(publicKey);
        setBalance(info.lamports / web3.LAMPORTS_PER_SOL);
      }
    };
    getInfo();
    // if the connection or publicKey changes, run the code, these are the state dependencies
  }, [connection, publicKey]);

  const outputs = [
    {
      title: "Account Balance...",
      dependency: balance,
    },
    {
      title: "Transaction Signature...",
      dependency: txSig,
      href: `https://explorer.solana.com/tx/${txSig}?cluster=devnet`,
    },
  ];

  return (
    <main className="min-h-screen text-white max-w-7xl">
      <section className="grid grid-cols-1 sm:grid-cols-6 gap-4 p-4">
        <form className="rounded-lg min-h-content p-4 bg-[#2a302f] sm:col-span-6 lg:col-start-2 lg:col-end-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-2xl text-[#fa6ece]">Send Sol 💸</h2>
            <button
              onClick={handleTransaction}
              disabled={!account || !amount}
              className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fa6ece] bg-[#fa6ece] rounded-lg w-24 py-1 font-semibold transition-all duration-200 hover:bg-transparent border-2 border-transparent hover:border-[#fa6ece]"
            >
              Submit
            </button>
          </div>
          <div className="mt-6">
            <h3 className="italic text-sm">Address of receiver</h3>
            <input
              id="account"
              type="text"
              placeholder="Public key of receiver"
              className="text-[#9e80ff] py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white"
              onChange={(event) => setAccount(event.target.value)}
            />
          </div>
          <div className="mt-6">
            <h3 className="italic text-sm">Number amount</h3>
            <input
              id="amount"
              type="number"
              min={0}
              placeholder="Amount of SOL"
              className="text-[#9e80ff] py-1 w-full bg-transparent outline-none resize-none border-2 border-transparent border-b-white"
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div className="text-sm font-semibold mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2">
            <ul className="p-2">
              {outputs.map(({ title, dependency, href }, index) => (
                <li
                  key={title}
                  className={`flex justify-between items-center ${
                    index !== 0 && "mt-4"
                  }`}
                >
                  <p className="tracking-wider">{title}</p>
                  {dependency && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex text-[#80ebff] italic ${
                        href && "hover:text-white"
                      } transition-all duration-200`}
                    >
                      {dependency.toString().slice(0, 25)}
                      {href && <ExternalLinkIcon className="w-5 ml-1" />}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Finished;
