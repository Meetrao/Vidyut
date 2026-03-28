# VIDYUT — Smart Electricity Usage Monitoring Dashboard

VIDYUT Is a premium, comprehensive MERN-stack application integrated with a Python-based analytics microservice. It provides users with real-time electricity consumption monitoring, anomaly detection, and AI-driven energy-saving recommendations.

---

## 🚀 Key Features

- **Interactive Dashboard**: Real-time visualisation of electricity usage (kWh) and costs (₹).
- **Anomaly Detection**: Automatic identification of unusual usage spikes using Z-score statistical analysis.
- **AI Recommendations**: Personalized, rule-based energy-saving tips based on consumption patterns.
- **Premium UI**: Sleek Neumorphic and Glassmorphic design system for a superior user experience.
- **India-Centric Localization**: Support for local currency (₹), regional terminology, and Indian appliance standards.

---

## 🏗️ Architecture

The project consists of three main components:

1.  **Client (Frontend)**: React application with Recharts and Chart.js for data visualization.
2.  **Server (Backend API)**: Node.js & Express API managing user data and CSV uploads.
3.  **Python Service (Analytics)**: Flask microservice using Pandas, NumPy, and SciPy for data processing and statistical analysis.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB Atlas account (or local MongoDB)

### 2. Backend (Node.js/Express)
1. Navigate to `/server`.
2. Install dependencies: `npm install`.
3. Create a `.env` file with `MONGO_URI` and `JWT_SECRET`.
4. Start the server: `npm run dev`.

### 3. Frontend (React)
1. Navigate to `/client`.
2. Install dependencies: `npm install`.
3. Start the application: `npm start`.

### 4. Analytics Service (Python)
1. Navigate to `/python-service`.
2. Create a virtual environment: `python -m venv venv`.
3. Activate the environment:
    - macOS/Linux: `source venv/bin/activate`
    - Windows: `venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`.
5. Run the service: `python app.py`.

---

## 📊 Analytics Details

The Python service handles the "Heavy Lifting":
- **Z-Score Detection**: Identifies spikes greater than 2.5 standard deviations.
- **Trend Analysis**: Uses linear regression to determine if usage is increasing, stable, or decreasing.
- **Monthly Aggregates**: Groups records by month for historical comparison.

