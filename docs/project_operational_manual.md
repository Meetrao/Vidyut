# VIDYUT: Project Operational Manual 🛡️

This document provides a comprehensive breakdown of the **VIDYUT Energy Intelligence Dashboard**. It covers the system architecture, mathematical calculations, and a detailed guide to every interactive element in the platform.

---

## 1. Project Architecture (The Data Journey)

VIDYUT is built on a **Quad-Layer Stack** designed for high-performance data processing and luxury visualization.

1.  **Frontend (React/Vite)**: The "Aesthetic Layer." It uses a bespoke Glassmorphic design system (Mist Alabaster & Royal Onyx) to present data. It communicates with the backend via RESTful APIs.
2.  **Backend Server (Node.js/Express)**: The "Orchestrator." It handles authentication, database CRUD (Create, Read, Update, Delete) operations, and coordinates between the UI and the AI engine.
3.  **AI Microservice (Python/Flask)**: The "Intelligence Engine." This layer uses data science libraries (Pandas, NumPy, Scipy) to perform heavy mathematical lifting.
4.  **Database (MongoDB Atlas)**: The "Memory." A NoSQL database that stores user profiles, energy records, sentinels, and notifications.

### 🔄 The Life of a Data Point
When you upload a CSV:
`CSV File` → `React Frontend` → `Node Server` → `Python AI Service (Math)` → `Node Server` → `MongoDB` → `Dashboard UI`.

---

## 2. Core Working & Calculations (Bharat Intelligence) 🧮

VIDYUT is specifically calibrated for the Indian household context (8–20 kWh/day). Here is how the AI "thinks":

### A. Anomaly Detection (Multiplicative Baseline)
The system identifies "Spikes" using a **Dynamic Baseline** method tailored for Indian urban and semi-urban settings.
- **Formula**: $Units > (Baseline \times SeasonalMultiplier \times 2.5)$
  - **Baseline**: The AI "learns" your home's typical steady-state usage (usually 8–20 kWh per day).
  - **Seasonal Multiplier**: Automatically adjusts for **Indian Summer** (1.5x for Apr–Jun) and **Festive Periods** (1.3x for Oct–Nov) to prevent false alerts.
- **Logic**: An anomaly is only triggered if your usage exceeds **2.5x to 3x** of your seasonally-adjusted baseline. This ensures minor fluctuations (like an extra fan or light) are ignored, while true "Breaches" (faulty geysers or leakages) are caught.

### B. Trend Analysis (Linear Regression)
The system calculates if your usage is "Increasing", "Decreasing", or "Stable."
- **Logic**: It fits a line through your monthly data points. If the "slope" of that line is positive, your trend is `increasing`. For Indian households, a slope $> 5$ triggers an audit recommendation for appliance efficiency.

### C. Sentinel Monitoring (Threshold Logic)
Sentinels are automated guards you set up manually. 
- **Logic**: Every time new data is added, the server runs a check: `if (CurrentRecord > SentinelThreshold) { triggerNotification() }`. This works in tandem with the AI's automatic anomaly detection.

### D. Bharat Contextual Factors
- **Climate Awareness**: The system expects higher loads during peak summer heat (Air Conditioning) and does not penalize this usage provided it stays within the calculated 1.5x seasonal buffer.
- **Appliance Profiling**: Logic is tuned for Indian appliances like BEE 5-star Ceiling Fans, Inverter ACs, and high-wattage Geysers.
- **Peak Hour Logic**: Fixed Range: 18:00 – 22:00 (6 PM – 10 PM). Any usage within this window is flagged as "Peak Hour," often corresponding to high-occupancy Indian household routines.

---

## 3. Interaction Map: What does each button do? 🖱️

### A. Global Navigation (Sidebar)
- **Dashboard**: High-level overview of total units, costs, and alert counts.
- **Upload CSV**: The primary intake portal. Drag and drop your bill data here.
- **Analytics**: "Deep Intelligence" view with Z-score intensity charts and AI recommendations.
- **History**: The raw ledger. Search, filter, and export your data here.
- **Alerts (Sentinels)**: Configure your automated guards (e.g., "Alert me if daily cost > ₹500").
- **Admin**: (Access Restricted) Manage system users and global settings.

### B. The Command Center (Dashboard)
- **Stat Cards**: Clickable cards (Total Consumption, Cost, etc.). Clicking the "Anomalies" card takes you directly to the analysis report.
- **Anomaly Banner**: A high-visibility warning that appears only when $Z > 2.5$ spikes are detected.
- **Trend Charts**: Interactive line and bar charts (Chart.js) that allow you to hover and see specific monthly values.

### C. The Sentinel Portal (Alerts)
- **Activate Alert (📡)**: This button initializes a new background task. Once clicked, the system begins real-time monitoring of your consumption against that specific threshold.
- **Trash Icon (🗑️)**: Deactivates and purges the sentinel from the monitoring queue.

### D. Themes & Notifications (Topbar)
- **Theme Toggle (☀️/🌙)**: Switches the design system between **Mist Alabaster** (Light) and **Royal Obsidian** (Dark).
- **Notification Bell (🔔)**: The "Intelligence Feed." It aggregates all sentinel breaches and AI detections into a single, scrollable stream.

---

## 4. Why it feels "Premium" (Luxe Aesthetics) ✨

- **Mist Alabaster Base**: We replaced pure white with `#f4f5f7` to reduce screen glare and provide a gallery-grade feel.
- **48px Elite Refraction**: Cards use high-blur backdrops (`32px` to `48px`) to look like thick glass.
- **Bespoke Iconography**: We purged all system emojis (🔔, ⚡, ✅) and replaced them with custom-engineered SVG icons to ensure a non-generic, professional SaaS look.
- **Atmospheric Gradients**: Subtle background mesh gradients (3-5% opacity) breathe life into the UI without distracting from the data.

---

## 5. Technology Summary
- **Frontend**: React 18, Vite, Chart.js, Vanilla CSS Glassmorphism.
- **Backend**: Express, Node.js, JWT Auth.
- **AI**: Python 3, Pandas, Scipy, NumPy.
- **Database**: MongoDB.

**Conclusion**: VIDYUT isn't just a dashboard; it's an automated energy auditor that uses statistical analysis to protect your budget.
