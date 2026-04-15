# VIDYUT 🛡️
### Energy Intelligence & High-Fidelity Analytics

VIDYUT is a specialized energy monitoring ecosystem engineered for precision. It abandons generic "dashboarding" in favor of a **Luxe High-Fidelity Experience**, combining a MERN architecture with a dedicated Python statistical microservice to transform raw electricity usage into actionable intelligence.

---

## 🎨 The Luxe Foundation
VIDYUT is built on a custom design system that prioritizes restful, gallery-grade aesthetics over clinical reporting.

- **Mist Alabaster Palette**: A sophisticated `#f4f5f7` foundation engineered to reduce screen glare while maintaining a restive, premium feel.
- **48px Elite Refraction**: Our UI uses custom glassmorphic tokens with `48px` backdrop blurs and `1px` high-contrast borders, creating a sense of physical depth.
- **Bespoke Iconography**: The system is 100% free of system emojis. We engineered a custom SVG icon vault to ensure every visual marker (Zaps, Bells, Shields) matches the software's high-end profile.

## 🧠 The Intelligence Core (Python-Service)
At the heart of VIDYUT is a mathematical engine that performs deep-statistical analysis in real-time.

- **Anomaly Detection (Z-Score)**: The system calculates the Z-Score intensity for every reading ($Z = |(x - \mu) / \sigma|$). Any spike exceeding a **2.5 threshold** is flagged as a potential breach or faulty appliance.
- **Linear Regression Trends**: We use Scipy-powered linear regression to determine if consumption is increasing, decreasing, or stable over long-term windows.
- **Sentinel Monitoring**: Automated background "sentinels" guard your budget by comparing every live data point against your customized currency and unit thresholds.

---

## 🏗️ Technical Architecture
We chose a distributed architecture to separate raw data persistence from heavy analytical lifting.

- **Frontend**: React 18 with Vite. Optimized for sub-second visual reactivity.
- **Backend Orchestrator**: Node.js & Express. Manages the intelligence feed and Sentinel breach alerts.
- **AI Analytics Microservice**: Python Flask. Handles high-performance data processing using **Pandas** and **NumPy**.
- **Persistence**: MongoDB Atlas. Encrypted, high-availability storage for usage records.

---

## 🛠️ Developer Setup

### 1. Intelligence Engine (Python)
```bash
cd python-service
# Recommended: python -m venv venv
pip install -r requirements.txt
python app.py  # Service runs on port 5001
```

### 2. The Orchestrator (Node.js)
```bash
cd server
npm install
# Configure your .env with MONGO_URI and JWT_SECRET
npm run dev
```

### 3. High-Fidelity UI (React)
```bash
cd client
npm install
npm run dev
```

---

## 📂 Intelligence Mapping
- **/docs**: Contains the project's **Operational Manual** and **Technical Diagrams**.
- **/client/src/components/Icons.jsx**: Our bespoke, high-fidelity SVG icon library.
- **/python-service/app.py**: The mathematical core of the anomaly detection engine.

**VIDYUT** is an ongoing pursuit of engineering precision and high-end design. Built for those who demand more than just a chart.
