const express = require("express");
const mongoose = require("mongoose");
const stripe = require("stripe")(
  "sk_test_51ODouxSA9DNdHYlEXf1qrO6kDrI91dX75F2J7aYU6FRtzwOTCVrcXAFdZRO4l2psMMQ4fwYH3HZdDc4fZ6IH2z6u00aX4iDYSW"
);

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect("mongodb+srv://manthenasaiteja27:<3N9icpAs34tSr9so>@stripe-payment-app.sgjyw9b.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a schema and model for transactions
const transactionSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  transactionID: String,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

app.use(express.json());

// Payment Page
app.post("/create-payment-intent", async (req, res) => {
  const { name, amount } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // amount in cents
    currency: "usd",
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

// View Transactions Page
app.get("/view-transactions", async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
