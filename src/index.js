import MetaMaskOnboarding from '@metamask/onboarding';
import Web3 from 'web3';
import checkWallet from './models/checkWallet';

const onboarding = new MetaMaskOnboarding();
const btnConnect = document.querySelector('.botun');
const btnSend = document.querySelector('#submit');
const balancetxt = document.querySelector('#balancetxt');
const adresstxt = document.querySelector('#adresstxt');
const paymentFrm = document.querySelector('#payentForm');
const ftr = document.querySelector("#footer");
const transactionsContainer = document.querySelector("#transactionsContainer"); // Add a container for transactions

let web3;
let accounts = [];
let balance;
let walletAddress;

const isMetaMaskInstalled = () => {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
};

const connected = (accounts) => {
    console.log("connected");
    fetchBalance();
};

async function connectWallet() {
    return await ethereum.request({ method: 'eth_accounts' });
}

const onClickInstallMetaMask = () => {
    onboarding.startOnboarding();
};

btnConnect.addEventListener('click', async () => {
    try {
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        connected(accounts);
    } catch (error) {
        console.error(error);
    }
});

const MetaMaskClientCheck = async () => {
    if (!isMetaMaskInstalled()) {
        statusText.innerText = 'You need to Install a Wallet';
        btnConnect.innerText = 'Install MetaMask';
        btnConnect.onclick = onClickInstallMetaMask;
    } else {
        try {
            accounts = await connectWallet();
            if (accounts && accounts.length > 0) {
                connected(accounts);
                walletAddress = accounts[0];
                console.log('Wallet Address:', walletAddress);
            } else {
                statusText.innerHTML = 'Connect your wallet';
                btnConnect.innerText = 'Connect MetaMask';
            }
        } catch (error) {
            console.error(error);
        }
    }
};

const fetchBalance = async () => {
    if (web3 && accounts && accounts.length > 0) {
        try {
            balance = await web3.eth.getBalance(accounts[0]);
            console.log(`Balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);
            balancetxt.innerText = `${web3.utils.fromWei(balance, 'ether')} ETH`;
        } catch (error) {
            console.error('Error fetching balance', error);
        }
    } else {
        console.error('Web3 is not initialized or accounts are not available.');
    }
};

const createTransactionCard = (transaction) => {
    const card = document.createElement('div');
    card.className = 'card';

    const reciverDiv = document.createElement('div');
    reciverDiv.id = 'reciver';
    reciverDiv.innerText = transaction.recivingWallet;
    card.appendChild(reciverDiv);

    const amountDiv = document.createElement('div');
    amountDiv.id = 'amount';
    amountDiv.innerText = transaction.amount;
    card.appendChild(amountDiv);

    const messageDiv = document.createElement('div');
    messageDiv.id = 'message';
    messageDiv.innerText = transaction.message;
    card.appendChild(messageDiv);

    const gifDiv = document.createElement('div');
    gifDiv.id = 'gif';
    const gifImg = document.createElement('img');
    gifImg.src = transaction.gif;
    gifDiv.appendChild(gifImg);
    card.appendChild(gifDiv);

    return card;
};

const initializeWeb3 = async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            await MetaMaskClientCheck();
            console.log('Web3 initialized successfully');
            if (accounts.length > 0) {
                walletAddress = accounts[0];
                paymentFrm.style.display = "block";
                ftr.style.display = "block";
                let strFirst = walletAddress.substring(0, 9);
                adresstxt.innerText = `${strFirst}**********`;
                console.log('Account:', walletAddress);

                const walletInfo = await checkWallet(walletAddress);
                if (walletInfo.length > 0) {
                    walletInfo.forEach(transaction => {
                        console.log('Transaction ID:', transaction.transactionID);
                        console.log('Receiving Wallet:', transaction.recivingWallet);
                        console.log('Amount:', transaction.amount);
                        console.log('Message:', transaction.message);
                        console.log('Gif:', transaction.gif);

                        // Create and append the transaction card
                        const card = createTransactionCard(transaction);
                        transactionsContainer.appendChild(card);
                    });
                } else {
                    console.log('No transactions found for the wallet address');
                }

                fetchBalance();
            } else {
                console.error('No accounts found');
            }
        } catch (error) {
            console.error('User denied account access', error);
        }
    } else {
        console.error('Non-Ethereum browser detected.');
    }
};

initializeWeb3();

// Giphy API
let APIKEYGIPHY = "7KLH71YJjPkxI0AHfXyyAwRp0uOcmaGM";
const gifSearch = document.querySelector('#gifSend');
let gifUrl;

gifSearch.addEventListener("change", function() {
    let url = `https://api.giphy.com/v1/gifs/search?api_key=${APIKEYGIPHY}&limit=1&q=`;
    let str = document.getElementById("gifSend").value.trim();
    url = url.concat(str);
    console.log(url);
    fetch(url)
      .then(response => response.json())
      .then(content => {
        console.log(content.data);
        console.log("META", content.meta);
        gifUrl = content.data[0].images.downsized.url;
      })
      .catch(err => {
        console.error(err);
      });
});

btnSend.addEventListener("click", async function() {
    const recivingWalletInput = document.getElementById("recivingWallet").value.trim();
    const amountInput = document.getElementById("moneySend").value.trim();
    const gifInput = gifUrl;
    const messageInput = document.getElementById("messageSend").value.trim();

    try {
        const response = await fetch('http://localhost:3000/sendTransaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                transactionWallet: walletAddress,
                recivingWallet: recivingWalletInput,
                amount: amountInput,
                message: messageInput,
                gif: gifInput
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Response from server:', data);

        // After successful transaction, create and append the new transaction card
        const newTransaction = {
            transactionID: data.transactionID, // Assuming response includes transactionID
            recivingWallet: recivingWalletInput,
            amount: amountInput,
            message: messageInput,
            gif: gifInput
        };

        const newCard = createTransactionCard(newTransaction);
        transactionsContainer.appendChild(newCard);
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }
});
