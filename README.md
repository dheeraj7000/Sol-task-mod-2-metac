Solana Phantom Wallet Integration
This React application demonstrates integration with the Solana blockchain using the Phantom wallet browser extension. The code allows users to create a new Solana account, connect their Phantom wallet, check the account balance, and transfer SOL (Solana's native cryptocurrency) between accounts.

Features
Create a New Solana Account:

Generates a new Solana account with a randomly generated keypair.
Airdrops 2 SOL to the newly created account to cover initial transaction costs.
Connect to Phantom Wallet:

Connects to the Phantom wallet extension if available.
Displays the connected wallet's public key.
Disconnect Wallet:

Disconnects the connected Phantom wallet.
Check Account Balance:

Retrieves and displays the balance of the newly created Solana account.
Transfer SOL:

Transfers 2 SOL from the newly created account to the connected wallet.
How to Use
Install Phantom Wallet:

Ensure the Phantom browser extension is installed.
Run the Application:

Clone the repository and navigate to the project folder.
Run npm install to install dependencies.
Run npm start to start the development server.
Open the application in a web browser.
Interact with the App:

Click "Create a new Solana account" to generate a new account and perform an initial airdrop.
Click "Connect Wallet" to connect the Phantom wallet.
Click "Disconnect Wallet" to disconnect the connected wallet.
Click "Transfer Sol" to transfer SOL from the created account to the connected wallet.
Use the "Get Balance" button to check the balance of the newly created account.
Note:

Wait for the initial airdrop and confirmations before performing transactions.
Ensure the Phantom wallet is unlocked and connected.
Dependencies
React
@solana/web3.js
Phantom browser extension
Acknowledgments
This code utilizes the Solana JavaScript SDK and interacts with the Phantom wallet extension.
Solana Devnet is used for testing transactions.
Disclaimer
This application is for educational purposes and may involve real transactions on the Solana blockchain. Use caution and do not use real SOL unless you understand the implications of the transactions.
