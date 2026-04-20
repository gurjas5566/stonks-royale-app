const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const Stock = require("./models/Stock");
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const userRoutes = require("./routes/userRoutes");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Express middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/users", userRoutes);

const updatePrices = () => {
  // This function will run every 5 seconds
  setInterval(async () => {
    try {
      // Find all stocks in the database
      const stocks = await Stock.find({});

      // 3% chance of Market Crash, 3% chance of Market Rally
      const eventRoll = Math.random();
      const isCrash = eventRoll < 0.03;
      const isRally = eventRoll >= 0.03 && eventRoll < 0.06;

      if (isCrash) io.emit("market_event", { type: "CRASH", message: "Market Crash!" });
      if (isRally) io.emit("market_event", { type: "RALLY", message: "Market Rally!" });

      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          let percentChange;
          
          if (isCrash) {
            // Drop between 4% and 12%
            percentChange = -(Math.random() * 0.08 + 0.04);
          } else if (isRally) {
            // Jump between 3% and 10%
            percentChange = Math.random() * 0.07 + 0.03;
          } else {
            // Normal fluctuation: -5% to +5%
            percentChange = Math.random() * 0.1 - 0.05;
          }

          let newPrice = stock.currentPrice * (1 + percentChange);

          // Floor the price at ₹5.00 so they never lose everything 100% to 0
          newPrice = Math.max(5.00, newPrice);
          // Cap the price at ₹5000 so it doesn't inflate infinitely
          newPrice = Math.min(5000.00, newPrice).toFixed(2);

          const newDailyChange = (newPrice - stock.currentPrice).toFixed(2);

          // Update the stock in the database
          const updatedStock = await Stock.findByIdAndUpdate(
            stock._id,
            {
              currentPrice: newPrice,
              dailyChange: newDailyChange,
              $push: {
                priceHistory: {
                  $each: [newPrice],
                  $slice: -20,
                },
              },
            },
            { new: true }
          );
          return updatedStock;
        })
      );

      // Emit the updated stock data to all connected clients
      io.emit("stock_prices_update", updatedStocks);
    } catch (error) {
      console.error("Error updating prices:", error.message);
    }
  }, 5000);
};

// Start the price update engine
updatePrices();

const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log(`Server running on port ${PORT}`));
