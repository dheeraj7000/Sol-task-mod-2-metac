// import necessary functionalities
import React, { useEffect, useState } from "react";
import "./App.css";
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  LAMPORTS_PER_SOL,
  Keypair,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

// create types for better code structure
type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

// create a provider interface to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description Gets Phantom provider, if it exists
 */
const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

function App() {
  // create state variables for the provider, wallet key, new created wallet key, and its balance
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );
  const [walletKey, setWalletKey] = useState<string | undefined>(undefined);
  const [newCreatedWalletKey, setNewCreatedWalletKey] = useState<
    Keypair | undefined
  >(undefined);
  const [newCreatedWalletBalance, setNewCreatedWalletKeyBalance] =
    useState<number>(0);

  // this useEffect runs once when the component mounts to get the provider
  useEffect(() => {
    const provider = getProvider();

    // if the phantom provider exists, set it as the provider
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  // utility function for timeout
  function timeout(delay: number) {
    return new Promise((res) => setTimeout(res, delay));
  }

  // function to get the wallet balance
  const getWalletBalance = async () => {
    try {
      if (newCreatedWalletKey) {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        const walletBalance = await connection.getBalance(
          new PublicKey(newCreatedWalletKey.publicKey)
        );
        console.log(
          `wallet balance: ${
            parseInt(walletBalance.toString()) / LAMPORTS_PER_SOL
          } SOL`
        );
        setNewCreatedWalletKeyBalance(
          parseInt(walletBalance.toString()) / LAMPORTS_PER_SOL
        );
      } else {
        console.log("Create New Wallet Account first");
      }
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * @description generates a new account on Solana with airdropping 2 SOLs in it.
   * This function is called when the 'Create a new Solana account' button is clicked
   */
  const createNewSolanaAccount = async () => {
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      // Generate a new Keypair account
      const newAccount = Keypair.generate();

      setNewCreatedWalletKey(newAccount);

      // Airdrop 2 SOL to the new account
      console.log(
        "Airdropping some SOL to " +
          new PublicKey(newAccount.publicKey).toString() +
          " wallet!"
      );
      const airDropSignature = await connection.requestAirdrop(
        new PublicKey(newAccount.publicKey),
        2 * LAMPORTS_PER_SOL
      );

      // Confirm the airdrop transaction
      let latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airDropSignature,
      });

      // Wait for 30 seconds due to Solana rate limit
      await timeout(30000);

      // Airdrop again to avoid potential issues
      console.log("Again Airdropping some SOL to my wallet!");
      const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(newAccount.publicKey),
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(fromAirDropSignature);

      console.log(
        "Airdrop completed for the " +
          new PublicKey(newAccount.publicKey).toString() +
          " account"
      );
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * @description prompts the user to connect the wallet if it exists.
   * This function is called when the 'Connect Wallet' button is clicked
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    // checks if the Phantom wallet exists
    if (solana) {
      try {
        // connects the wallet and returns a response which includes the wallet public key
        const response = await solana.connect();
        console.log("wallet account ", response.publicKey.toString());
        // update walletKey to be the public key
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  /**
   * @description prompts the user to disconnect the wallet.
   * This function is called when the 'Disconnect Wallet' button is clicked
   */
  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    // checks if the Phantom wallet exists
    if (solana) {
      try {
        // disconnects the wallet
        await solana.disconnect();
        // update walletKey to be undefined
        setWalletKey(undefined);
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  /**
   * @description transfers SOL from the newly created wallet to the connected wallet.
   * This function is called when the 'Transfer Sol' button is clicked
   */
  const transferSol = async () => {
    try {
      if (newCreatedWalletKey && walletKey) {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // Create a transaction to send money from "from" wallet to "to"
        // wallet
        var transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: newCreatedWalletKey.publicKey,
            toPubkey: new PublicKey(walletKey),
            lamports: LAMPORTS_PER_SOL * 2,
          })
        );

        // Sign the transaction
        var signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [newCreatedWalletKey]
        );
        console.log("Signature is ", signature);
      } else {
        console.log("NewCreatedWalletKey or wallet connection issue");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // HTML code for the app
  return (
    <div className="App">
      <header className="App-header">
        <h2>Connect to Phantom Wallet</h2>
        {newCreatedWalletKey ? (
          <>
            <label>Balance is {`${newCreatedWalletBalance}`} SOL</label>
            <button
              style={{
                fontSize: "16px",
                padding: "15px",
                fontWeight: "bold",
                borderRadius: "5px",
              }}
              onClick={getWalletBalance}
            >
              Get Balance (Note - wait 1 min for Solana Official Rate Time Delay)
            </button>
          </>
        ) : (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={createNewSolanaAccount}
          >
            Create a new Solana account
          </button>
        )}
        {provider && !walletKey && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
        {provider && walletKey && (
          <div>
            <button
              className="disconnect-btn"
              style={{
                fontSize: "16px",
                padding: "15px",
                fontWeight: "bold",
                borderRadius: "5px",
              }}
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </button>
            <p>Connected Account Address: {`${walletKey}`}</p>
            {newCreatedWalletKey && (
              <button
                style={{
                  fontSize: "16px",
                  padding: "15px",
                  fontWeight: "bold",
                  borderRadius: "5px",
                }}
                onClick={transferSol}
              >
                Transfer Sol
              </button>
            )}
          </div>
        )}

        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
      </header>
    </div>
  );
}

export default App;
