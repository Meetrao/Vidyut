# ⚡ VIDYUT — Smart Electricity Analytics Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Python Version](https://img.shields.io/badge/Python-v3.9%2B-blue.svg)](https://www.python.org/)
[![React Version](https://img.shields.io/badge/React-v19-61DAFB.svg)](https://reactjs.org/)

**VIDYUT** (विद्युत) is a high-performance, full-stack monitoring and analytics suite designed to revolutionise how households and businesses manage electricity consumption. Built with a modern MERN architecture and a Python-powered statistical engine, it provides real-time insights, anomaly detection, and AI-driven cost optimization.

---

## 🖼️ Preview

![VIDYUT Dashboard Mockup](file:///Users/meet/.gemini/antigravity/brain/a87af1af-ea14-4db4-bf31-c24fa7f49a01/dashboard_mockup_1774810657421.png)
*Figure 1: The flagship monitoring interface featuring glassmorphic design and real-time data visualization.*

---

## ✨ Key Features

### 📊 Advanced Data Visualization
- **Real-time Monitoring**: Live charts showing kWh consumption with sub-second latency simulation.
- **Cost Forecasting**: Predictive billing models based on current usage patterns and local tariff structures (₹).
- **Appliance Breakdown**: (Roadmap) Detailed analysis of which appliances are consuming the most energy.

### 🧠 Intelligent Analytics (Python Powered)
- **Anomaly Detection**: Uses Z-Core statistical models to identify unusual usage spikes, helping detect faulty appliances or energy leakages.
- **Trend Analysis**: Long-term usage trends using linear regression to determine seasonal variations.
- **Recommendations Engine**: Smart, rule-based tips to reduce footprint and save costs.

### 🎨 Premium User Experience
- **Glassmorphic UI**: A state-of-the-art interface built with vanilla CSS for maximum performance and visual punch.
- **Dark Mode Optimized**: Designed for high-contrast environments to reduce eye strain.
- **Responsive Design**: Seamless experience across Desktop, Tablet, and Mobile.

---

## 🏗️ System Architecture

The ecosystem is divided into three highly decoupled services:

| Component | Responsibility | Tech Stack |
| :--- | :--- | :--- |
| **Frontend** | UI/UX, Data Viz, User Interactions | React 19, Recharts, Axios |
| **Backend API** | Auth, Data Persistence, Orchestration | Node.js, Express, MongoDB, JWT |
| **Analytics** | Heavy Lifting, Stats, ML Inference | Python, Flask, Pandas, SciPy |

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.9 or higher
- **MongoDB**: A running instance (Local or Atlas)
- **Package Managers**: `npm` and `pip`

### 2. Backend Orchestrator (Node.js)
```bash
cd server
npm install
# Create a .env file with the following:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_super_secret_key
npm run dev
```

### 3. Analytics Microservice (Python)
```bash
cd python-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 4. Client Dashboard (React)
```bash
cd client
npm install
npm start
```

---

## 📂 Project Structure

```text
smart-electricity-dashboard/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard and Auth views
│   │   └── services/    # API integration layer
├── server/              # Node.js backend (Express)
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   └── controllers/     # Business logic
└── python-service/      # Analytics microservice
    ├── app.py           # Flask entry point
    └── utils/           # Data processing logic
```

---

## 🛡️ Security & Performance
- **Auth**: Secure JWT-based authentication with Bcrypt password hashing.
- **CORS**: Configured cross-origin resource sharing for secure inter-service communication.
- **Scalability**: Decoupled microservices allow independent scaling of the analytics engine.

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.


---

<p align="center">
  Built with ❤️ for a Greener Tomorrow.
</p>

