const express = require('express');
const path = require('path');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:8080' // Allow requests from this origin
}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transactiondb'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

app.post('/reciveWallet', (req, res) => {
  const receivedWallet = req.body.variable;
  console.log('Received variable:', receivedWallet);

  console.log("Inside /reciveWallet endpoint");

  const query = 'SELECT * FROM transactionInfo WHERE transactionWallet = ?';
  connection.query(query, [receivedWallet], (err, results) => {
    if (err) {
      console.error('Error executing database query:', err);
      res.status(500).send(err);
      return;
    }
    if (results.length === 0) {
      console.log('No transactions found for the wallet address');
      res.status(404).json({ message: 'No transactions found for this wallet address' });
      return;
    }
    console.log('Result of query:', results);
    // Extract individual properties from each result object
    const walletInfo = results.map(result => ({
      transwactionID: result.transactionID,
      recivingWallet: result.recivingWallet,
      amount: result.amount,
      message: result.message,
      gif: result.gif
    }));
    console.log(walletInfo);
    res.json({ message: 'Transactions found', walletInfo: walletInfo });
  });
});

app.post('/sendTransaction', (req, res) => {
  const { transactionWallet, recivingWallet, amount, message, gif } = req.body;

  console.log('Received transaction data:', req.body);

  const query = 'INSERT INTO transactionInfo (transactionWallet, recivingWallet, amount, message, gif) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [transactionWallet, recivingWallet, amount, message, gif], (err, results) => {
      if (err) {
          console.error('Error executing database query:', err);
          res.status(500).send(err);
          return;
      }

      console.log('Transaction successfully inserted into database');
      res.json({ message: 'Transaction successfully inserted into database' });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});