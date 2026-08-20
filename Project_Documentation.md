# Stonks Royale Documentation

Stonks Royale is a real-time stock market simulation game built with React Native (Expo) and Node.js. It allows users to simulate stock trading with live price updates, manage a portfolio, and compete on a leaderboard.

## 🚀 System Architecture

The application follows a client-server architecture with real-time data synchronization.

### 1. Frontend (Mobile App)
- **Framework:** React Native with Expo.
- **Routing:** Expo Router (File-based routing).
- **State Management:** React Hooks and local state.
- **Real-time Communication:** Socket.io-client for live price updates.
- **Styling:** Custom CSS/Styles in React Native.
- **Key Libraries:**
    - `react-native-chart-kit`: For rendering stock price history graphs.
    - `lucide-react-native`: For consistent iconography.
    - `axios`: For REST API communication.
    - `expo-secure-store`: For storing authentication tokens securely.

### 2. Backend (Server)
- **Runtime:** Node.js.
- **Framework:** Express.js.
- **Database:** MongoDB (via Mongoose).
- **Real-time Engine:** Socket.io for pushing price updates to all connected clients.
- **Authentication:** JWT (JSON Web Tokens) with Bcrypt password hashing.
- **Key Logic:**
    - **Market Engine:** A background process in `server.js` that updates stock prices every 5 seconds.
    - **Market Events:** Randomly triggers "Market Crash" or "Market Rally" events affecting price volatility.

---

## 🛠️ Features

### 📈 Live Trading Simulation
- **Real-time Prices:** Stock prices fluctuate every 5 seconds.
- **Interactive Charts:** View price history for individual stocks.
- **Trading:** Buy and sell stocks using virtual currency.

### 💼 Portfolio Management
- **Asset Tracking:** View all owned stocks, purchase prices, and current valuations.
- **Performance Analytics:** Real-time calculation of total profit/loss.
- **History:** Comprehensive log of all past trades.

### 🏢 Market Exploration
- **Sectors/Industries:** Stocks are categorized by industry (e.g., Tech, Finance, Energy).
- **Detailed Insights:** Deep dive into specific stock performance and market stats.

### 🏆 Competition
- **Leaderboard:** Compete with other users based on portfolio value and performance.

---

## 📁 Project Structure

### Frontend (`/app`)
- `(tabs)/`: Main navigation tabs.
    - `dashboard.tsx`: Market overview and live tickers.
    - `portfolio.tsx`: User's assets and P&L.
    - `industries.tsx`: Stock categorization.
    - `history.tsx`: Past transaction logs.
    - `leaderboard.tsx`: User rankings.
- `stock/`: Stock detail screens.
- `sector/`: Industry-specific stock lists.
- `index.tsx` & `register.tsx`: Authentication flow.

### Backend (`/server`)
- `server.js`: Main entry point and Price Update Engine.
- `models/`: Database schemas (User, Stock, Trade).
- `routes/`: API endpoints (Auth, Stocks, Trading, User).
- `controllers/`: Business logic for each route.
- `config/`: Database connection and environment setup.
- `seedStocks.js`: Utility script to populate the database with initial stock data.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js installed.
- MongoDB instance (local or Atlas).
- Expo Go app on mobile or an emulator.

### Backend Setup
1. Navigate to `/server`.
2. Run `npm install`.
3. Configure `.env` with `MONGO_URI`, `JWT_SECRET`, and `PORT`.
4. Run `npm start` to launch the server and price engine.

### Frontend Setup
1. Navigate to the root directory.
2. Run `npm install`.
3. Update API base URL in `utils/api.js` (or similar) to point to your server.
4. Run `npx expo start`.

---

## 🛑 Security & Reliability
- **Password Hashing:** Uses `bcryptjs` for secure user credential storage.
- **Protected Routes:** API endpoints are secured using JWT middleware.
- **Price Safeguards:** The market engine floors prices at ₹5.00 and caps them at ₹5000.00 to prevent extreme outliers or total depletion.
