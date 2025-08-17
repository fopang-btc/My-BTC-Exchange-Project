let token = "";
let previousPrices = {};

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

  // Initial price fetch
  await updatePrices();

  // Real-time refresh every 30 seconds with alerts
  setInterval(async () => {
    await updatePrices(true); // true for change checks
  }, 30000);
}

async function updatePrices(checkChanges = false) {
  const pricesRes = await fetch("http://localhost:3000/api/prices");
  const prices = await pricesRes.json();

  // Update all 20 prices
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

  // Alert for big changes (>1%)
  if (checkChanges) {
    for (const coin in prices) {
      if (
        previousPrices[coin] &&
        Math.abs(prices[coin].usd - previousPrices[coin]) /
          previousPrices[coin] >
          0.01
      ) {
        alert(
          `${coin.toUpperCase()} price changed >1% to $${prices[coin].usd}!`
        );
      }
    }
  }
  previousPrices = { ...prices };
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

  // Portfolio valuation
  const pricesRes = await fetch("http://localhost:3000/api/prices");
  const prices = await pricesRes.json();
  let portValue = 0;
  for (const [coin, amount] of Object.entries(user.portfolio)) {
    portValue += amount * (prices[coin]?.usd || 0);
  }
  const total = user.balance + portValue;
  document.getElementById("totalValue").textContent = total.toFixed(2);

  // Chart (mocked with start and current; expand later)
  const ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Start", "Current"],
      datasets: [
        {
          label: "Net Worth",
          data: [10000, total],
          borderColor: "#4caf50",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: { y: { beginAtZero: false } },
    },
  });
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
