let token = "";

async function signup() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const response = await fetch("http://localhost:3000/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  alert(data.message || data.error);
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const response = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (data.token) {
    token = data.token;
    showDashboard(data.user);
  } else {
    alert(data.error);
  }
}

async function showDashboard(user) {
  document.getElementById("auth").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("userName").textContent = user.username;
  updateUser();

  // Fetch and display prices
  const pricesRes = await fetch("http://localhost:3000/api/prices");
  const prices = await pricesRes.json();
  document.getElementById("btcPrice").textContent = prices.bitcoin.usd;
  document.getElementById("ethPrice").textContent = prices.ethereum.usd;
  document.getElementById("xrpPrice").textContent = prices.ripple.usd;
  document.getElementById("usdtPrice").textContent = prices.tether.usd;
  document.getElementById("bnbPrice").textContent = prices.binancecoin.usd;
  document.getElementById("solPrice").textContent = prices.solana.usd;
  document.getElementById("usdcPrice").textContent = prices["usd-coin"].usd;
  document.getElementById("adaPrice").textContent = prices.cardano.usd;
  document.getElementById("avaxPrice").textContent = prices["avalanche-2"].usd;
  document.getElementById("trxPrice").textContent = prices.tron.usd;
  document.getElementById("dogePrice").textContent = prices.dogecoin.usd;
  document.getElementById("linkPrice").textContent = prices.chainlink.usd;
  document.getElementById("tonPrice").textContent =
    prices["the-open-network"].usd;
  document.getElementById("maticPrice").textContent =
    prices["matic-network"].usd;
  document.getElementById("shibPrice").textContent = prices["shiba-inu"].usd;
  document.getElementById("ltcPrice").textContent = prices.litecoin.usd;
  document.getElementById("bchPrice").textContent = prices["bitcoin-cash"].usd;
  document.getElementById("dotPrice").textContent = prices.polkadot.usd;
  document.getElementById("uniPrice").textContent = prices.uniswap.usd;
  document.getElementById("nearPrice").textContent = prices.near.usd;
}

async function updateUser() {
  const response = await fetch("http://localhost:3000/api/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = await response.json();
  document.getElementById("balance").textContent = user.balance.toFixed(2);
  const portfolioList = document.getElementById("portfolio");
  portfolioList.innerHTML = "";
  for (const [coin, amount] of Object.entries(user.portfolio)) {
    const li = document.createElement("li");
    li.textContent = `${coin.toUpperCase()}: ${amount}`;
    portfolioList.appendChild(li);
  }
}

async function trade(action) {
  const coin = document.getElementById("coin").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const response = await fetch("http://localhost:3000/api/trade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ coin, amount, action }),
  });
  const data = await response.json();
  if (data.error) {
    alert(data.error);
  } else {
    updateUser();
  }
}
