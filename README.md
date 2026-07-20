# 🩸 LifeFlow - Blood Bank Management System

LifeFlow is a premium, full-stack Blood Bank Management System built for regional reserve monitoring, donor coordination, emergency dispatches, and blood demand forecasting.

## 🌟 Key Features
*   **Modern Interactive Dashboard:** Sleek red-themed layout detailing stock metrics, warning items, recent activities, and predictions.
*   **District Monitoring Map:** Custom SVG map of Sri Lanka with interactive hover indicators showing district availability grades (Good, Low, Critical).
*   **Forecasting Risk Analytics:** Predictive shortage calculations with adjustable ML parameters (Accidents, Weather, Outbreaks).
*   **Emergency Dispatch Board:** Real-time requests queue tracking clinics requesting urgent shipments with status updates.
*   **Excel & PDF Export:** Custom formatting CSV and log text generator exporting direct download file blobs.
*   **Role-Based Security:** Protected paths for Administrators, Hospital Staff, and Coordinators with JWT keys.
*   **Zero-Config Sandbox Mode:** Connects to MongoDB, but includes a built-in mock memory database that works instantly if MongoDB is not active!

---

## 📁 Project Directory Structure
```
lifeflow/
├── client/          # Frontend React + Vite
│   ├── src/
│   │   ├── components/   # SriLankaMap, Charts
│   │   ├── layouts/      # DashboardLayout shell
│   │   └── pages/        # Login, Inventory, Donors, Predictions
│   └── index.html
├── server/          # Backend Node.js + Express
│   ├── config/      # db.js Mongoose connectors
│   ├── controllers/ # CRUD route functions
│   ├── models/      # Mongoose schemas
│   ├── routes/      # Express API routers
│   └── utils/       # mockDb sandbox datasets
├── README.md
└── package.json     # Workspace commands
```

---

## ⚙️ Installation & Running

### 1. Install Dependencies
In the root directory `lifeflow/`, run:
```bash
npm run install-all
```
*This installs dependencies for both `server/` and `client/` directories in one command.*

### 2. Configure Database (Optional)
By default, the application runs in **Sandbox Fallback Mode** with realistic data. To connect a live MongoDB database:
1. Open `server/.env`
2. Add your MongoDB connection string to the `MONGODB_URI` key:
   ```env
   MONGODB_URI=mongodb://localhost:27017/lifeflow
   ```

### 3. Launch the Application
Run the backend server (starts on Port `5000`):
```bash
npm run server
```

In a new terminal window, run the Vite development client (starts on Port `3000`):
```bash
npm run client
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Sandbox Credentials
Use these pre-populated credentials to log in:

*   **System Administrator (Full access):**
    *   **Email:** `admin@lifeflow.lk`
    *   **Password:** `admin123`
*   **Hospital Staff:**
    *   **Email:** `staff@kandy.lk`
    *   **Password:** `staff123`
