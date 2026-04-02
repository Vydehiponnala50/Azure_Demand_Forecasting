# Azure Demand Forecasting & Capacity Optimization System

![Azure Capacity AI Dashboard](https://img.shields.io/badge/Status-Production--Ready-brightgreen)
![Python 3.9+](https://img.shields.io/badge/Python-3.9+-blue)
![React](https://img.shields.io/badge/React-Vite-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-Framework-009688)
![ML Engine](https://img.shields.io/badge/ML--Engine-XGBoost-orange)

An end-to-end enterprise-grade MLOps platform designed to forecast Azure resource demand (Compute, Storage, Network) with automated monitoring, retraining, and an interactive real-time dashboard.

---

## 🚀 Key Features

### 1. **Machine Learning Engine**
*   **XGBoost Regressor**: High-performance gradient boosting model trained on multi-regional Azure telemetry datasets.
*   **Feature Engineering**: Automated time-series pipeline including seasonality lags, rolling averages, and data center categorical encoding.
*   **Predictive Analytics**: Real-time and Batch inference support.

### 2. **Operational MLOps**
*   **Daily Scheduler**: Automated batch processing at **06:00 AM** daily via `scripts/scheduler.py`.
*   **Performance Monitoring**: Tracking RMSE and MAE for model drift.
*   **Automated Retraining**: Candidate models are automatically evaluated and promoted only if accuracy outperforms the current production baseline.
*   **Anomaly Detection**: Integrated 3-Sigma statistical layer tagging unusual utilization spikes in red.
*   **Interactive Drill-Down**: Click on any Region in the Bar Chart or Service in the Pie Chart to instantly filter the entire dashboard view.

### 3. **Real-time Dashboard**
*   **Interactive Visuals**: Glassmorphic UI featuring Recharts for historical vs. forecast comparisons.
*   **Global Filters**: Instantly isolate metrics by **Region**, **Service Type**, and **Peak Demand Thresholds**.
*   **Custom Predictor**: Direct CSV upload functionality to trigger on-demand AI forecasts for custom datasets.

---

## 🎥 Project Demo Video

[▶️ Watch Demo](https://drive.google.com/file/d/1jKN8N2QGXeLBKgKKU-R-WyuB3zIDLkTO/view?usp=drivesdk)

## 📂 Project Directory Structure

```bash
├── app/                 # FastAPI Production API
│   ├── main.py          # Command Center Entrypoint
│   ├── model/           # XGBoost Loading & Singleton Fabric
│   └── preprocessing/   # Sklearn Transformation Logic
├── frontend/            # High-Fidelity React Dashboard
│   ├── src/App.jsx      # Unified Dashboard & Logic Hub
│   └── src/index.css    # Professional Glassmorphism Styles
├── scripts/             # Enterprise MLOps Automation
│   ├── train.py         # Initial Model Seeding
│   ├── retrain.py       # Automated Delta Retraining
│   ├── monitor.py       # Drift & Anomaly Governance
│   └── tracker.py       # Performance Performance Logging
├── data/                # Telemetry & Output Hub (.csv)
├── models/              # Serialized AI Assets (.pkl)
├── Dockerfile           # Backend Containerization
└── render.yaml          # Cloud Blueprint (Azure/Render)
```

---

## 🛠️ Getting Started

### Prerequisites
*   Python 3.9+ 
*   Node.js (for Dashboard)
*   Docker (Optional for Containerization)

### Backend Setup
1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2.  Initialize the model:
    ```bash
    python scripts/generate_data.py
    python scripts/train.py
    ```
3.  Start the API:
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 10000
    ```

### Frontend Setup
1.  Navigate to the directory:
    ```bash
    cd frontend
    npm install
    ```
2.  Run the Dashboard:
    ```bash
    npm run dev
    ```
3.  Access the UI at: `http://localhost:5173`

### Containerized Deployment
Launch the entire stack (API + Batch Scheduler) using Docker:
```bash
docker-compose up -d --build
```

---

## 📈 Monitoring & Alerts
The system tracks model performance metrics. If the **RMSE** exceeds a predefined threshold (drift detected), the monitoring service logs an alert. You can configure your **Peak Alert Threshold** directly on the dashboard's sidebar sliders to activate visual warnings for capacity breaches.

---

## 🛡️ License
Distributable for internal Azure Engineering and Capacity Planning Teams.
