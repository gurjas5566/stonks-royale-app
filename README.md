# Stonks Royale  
### Real-Time Gamified Trading Simulator  
**Built with MERN Stack & React Native (Expo)**

Stonks Royale is a mobile-first trading simulator that blends financial education with competitive gameplay. It features a live market engine, modern glassmorphic UI, and a progression system driven by trading performance.

---

## 🚀 Key Features

### ⚡ Real-Time Market  
- Live price updates every 2 seconds using WebSockets (Socket.io)  
- Powered by a Gaussian random walk algorithm  

### 🏆 Progression System  
- Earn XP for profitable trades  
- Level up from Beginner 🐥 to Whale 🐳  
- Compete on a global leaderboard  

### 📊 Analytics  
- Interactive charts (react-native-chart-kit)  
- Portfolio breakdown by sector & value  

### 💎 UI/UX  
- Glassmorphism design  
- Haptic feedback for interactions  

---

## 🏗️ Architecture

- **Backend (Engine):** Node.js + Express (business logic, JWT auth, DB updates)  
- **Database:** MongoDB with Mongoose  
- **Realtime Layer:** Socket.io for live price streaming  
- **Frontend (Client):** React Native (Expo), optimized rendering  

---

## 🛠️ Tech Stack

- **Frontend:** React Native, Expo, Expo Router  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB, Mongoose  
- **Realtime:** Socket.io  
- **Auth:** JWT, Bcrypt  
- **Charts:** React Native Chart Kit  
