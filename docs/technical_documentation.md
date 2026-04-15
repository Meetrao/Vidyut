# Technical Engineering Suite - VIDYUT 📊

This suite provides the professional Mermaid diagrams for the VIDYUT Smart Electricity Dashboard. These can be rendered in any Mermaid-compatible viewer (GitHub, VS Code, etc.).

## 1. Project Scheduling (Gantt Chart)
Tracks the evolution from high-fidelity prototype to the current Luxe / Bespoke standard.

```mermaid
gantt
    title VIDYUT Development Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: Foundation
    Design System (Glassmorphic)    :active, des1, 2026-03-01, 10d
    MERN Stack Setup               :done, des2, 2026-03-11, 7d
    Python AI Microservice         :done, des3, 2026-03-18, 14d
    section Phase 2: Intelligence
    CSV Upload Engine              :done, int1, 2026-04-01, 5d
    Anomaly Detection Logic        :done, int2, 2026-04-06, 7d
    Sentinel Alert System          :done, int3, 2026-04-08, 5d
    section Phase 3: Luxe Overhaul
    Mist Alabaster Styling         :done, lux1, 2026-04-13, 2d
    Icon Purification (Emoji Purge):active, lux2, 2026-04-15, 1d
    Final Polish & Verification    :lux3, after lux2, 2d
```

---

## 2. Data Flow Diagrams (DFD)

### Context Diagram (Level 0)
The high-level interaction between the user and the system.

```mermaid
graph LR
    User([User / Admin]) -- Uploads CSV / Configs Alerts --> VIDYUT[VIDYUT System]
    VIDYUT -- Analytics Reports / Push Notifications --> User
    VIDYUT -- Stores Data --> DB[(MongoDB)]
```

### System Decomposition (Level 1)
Detailed flow between the application components and the AI engine.

```mermaid
graph TD
    User([User]) --> UI[React Client / Glassmorphic UI]
    UI -- JSON API Request --> Server[Express.js Server]
    Server -- Raw Data --> PythonService[Python Flask / AI Service]
    PythonService -- Z-Score Analysis --> Server
    Server -- Store Results --> DB[(MongoDB)]
    Server -- Trigger Sentinel --> NT[Notification System]
    NT -- Socket.io --> UI
    UI -- Visual Insights --> User
```

---

## 3. Block Diagram (System Architecture)
High-level overview of the technology stack and communication layers.

```mermaid
graph TB
    subgraph "Frontend Layer (React/Vite)"
        UI[Glassmorphic Dashboard]
        Charts[Chart.js Engine]
        Icons[Bespoke SVG Library]
    end

    subgraph "Backend Layer (Node.js)"
        API[Express REST API]
        Auth[JWT Authentication]
        logic[Sentinel Logic]
    end

    subgraph "AI Extraction Layer (Python)"
        Flask[Flask API]
        Data[Pandas / NumPy]
        AI[Scikit-learn Anomaly Detection]
    end

    UI <--> API
    API <--> DB[(MongoDB Atlas)]
    API <--> Flask
    Flask <--> Data
    Data <--> AI
```

---

## 4. Flowchart (System Process Flow)
Typical journey from data ingestion to real-time alerting.

```mermaid
flowchart TD
    Start([User Login]) --> Dashboard[View Dashboard Metrics]
    Dashboard --> Upload{Upload CSV?}
    Upload -- Yes --> Process[Server Parses CSV]
    Process --> AIDetect[Python Engine Calculates Z-Scores]
    AIDetect --> Anomaly{Anomaly Found?}
    Anomaly -- Yes --> Alert[Create Notification & Sentinel Breach]
    Anomaly -- No --> Healthy[Update Trend Analytics]
    Alert --> UI[Display Highlighted Record]
    Healthy --> UI
    UI --> End([User Logs Out])
```

---

## 5. Use Case Diagram
Defining user and admin interactions with the intelligence suite.

```mermaid
graph LR
    subgraph "User Role"
        U1(View Consumption Stats)
        U2(Upload Bill Data)
        U3(View AI Recommendations)
    end

    subgraph "Admin Role"
        A1(Manage Global Sentinels)
        A2(System Health Logs)
    end

    Customer((Standard User)) --> U1
    Customer --> U2
    Customer --> U3

    Admin((System Admin)) --> A1
    Admin --> A2
    Admin --> U1
```

---

## 6. Class Diagram (Data Models)
Relationships between core entities in the VIDYUT database.

```mermaid
classDiagram
    User "1" *-- "many" UsageRecord : tracks
    User "1" *-- "many" Sentinel : configures
    UsageRecord "1" -- "0..1" AnomalyEffect : exhibits
    Sentinel "1" -- "many" Notification : triggers

    class User {
        +String name
        +String email
        +String role
        +login()
        +logout()
    }

    class UsageRecord {
        +Date date
        +Number units
        +Number cost
        +Boolean anomaly
        +Number zScore
    }

    class Sentinel {
        +String name
        +String type
        +Number threshold
        +Boolean active
        +checkBreach(data)
    }

    class Notification {
        +String message
        +String type
        +Boolean read
        +Date timestamp
    }
```
