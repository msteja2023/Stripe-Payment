document.addEventListener("DOMContentLoaded", async () => {
  const stripe = Stripe("pk_test_51ODouxSA9DNdHYlELEh5M7FgvRxAu7h6MQXOyjwi4WvCcOtHGtdZWp4PyXNveKZ1CxxQERjz2womMpfrvY9vporF00wtsImujY");
  const elements = stripe.elements();
  const clientSecretInput = document.getElementById("client-secret");
  const paymentForm = document.getElementById("payment-form");

  // Handle payment submission
  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { token, error } = await stripe.createToken(
      elements.getElement("card")
    );

    if (error) {
      console.error(error);
    } else {
      const { name, amount } = paymentForm.elements;
      const response = await fetch("/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.value,
          amount: amount.value,
        }),
      });

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement("card"),
          billing_details: {
            name: name.value,
          },
        },
      });

      if (result.error) {
        console.error(result.error);
      } else {
        // Payment succeeded, save transaction to the database
        await saveTransaction(
          name.value,
          amount.value,
          result.paymentIntent.id
        );
        // Clear form
        paymentForm.reset();
        // Fetch and display transactions
        displayTransactions();
      }
    }
  });

  // Fetch and display transactions on page load
  displayTransactions();

  async function displayTransactions() {
    const transactionsDiv = document.getElementById("transactions");
    const response = await fetch("/view-transactions");
    const transactions = await response.json();

    transactionsDiv.innerHTML = "";
    transactions.forEach((transaction) => {
      const transactionCard = document.createElement("div");
      transactionCard.innerHTML = `<p>Name: ${transaction.name}</p><p>Amount: ${transaction.amount}</p>`;
      transactionsDiv.appendChild(transactionCard);
    });
  }

  async function saveTransaction(name, amount, transactionID) {
    await fetch("/save-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        amount,
        transactionID,
      }),
    });
  }
});

