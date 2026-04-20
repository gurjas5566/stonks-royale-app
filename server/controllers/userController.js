const User = require("../models/user");
const Stock = require("../models/Stock");

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({});
    const stocks = await Stock.find({});

    const stockPriceMap = {};
    stocks.forEach((s) => {
      stockPriceMap[s.symbol] = s.currentPrice;
    });

    const leaderboard = users.map((user) => {
      let portfolioValue = 0;
      if (user.portfolio) {
        user.portfolio.forEach((item) => {
          const currentPrice = stockPriceMap[item.stockSymbol] || 0;
          portfolioValue += item.shares * currentPrice;
        });
      }
      const netWorth = user.cash + portfolioValue;

      let tag = "Beginner";
      if (netWorth >= 100000) tag = "Wall Street Whale";
      else if (netWorth >= 50000) tag = "Pro Trader";
      else if (netWorth >= 25000) tag = "Market Maker";
      else if (netWorth >= 15000) tag = "Rising Star";

      return {
        _id: user._id,
        username: user.username,
        level: user.level || 1,
        netWorth,
        tag
      };
    });

    // Sort descending by netWorth
    leaderboard.sort((a, b) => b.netWorth - a.netWorth);

    // Return top 50
    res.status(200).json(leaderboard.slice(0, 50));
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
