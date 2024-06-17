const checkWallet = async (walletAddress) => {
  console.log('Sending wallet address:', walletAddress); // Debugging log

  try {
    const response = await fetch('http://localhost:3000/reciveWallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variable: walletAddress })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Response from server:', data);

    if (data.walletInfo && data.walletInfo.length > 0) {
      console.log('Number of transactions:', data.walletInfo.length); // Log the length of the array
      return data.walletInfo; // Return the array of transactions
    } else {
      console.log('No transactions found for the wallet address');
      return []; // Return an empty array if walletInfo is empty
    }
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
    throw error;
  }
};

module.exports = checkWallet;
