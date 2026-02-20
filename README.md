# MUMBAIkar

AI-Powered Urban Infrastructure Monitoring Dashboard (Frontend-Only)

---

## Overview

**MUMBAIkar** is a frontend-driven Smart City Intelligence Platform designed for Mumbai.
It provides a centralized, interactive dashboard for monitoring urban infrastructure, environmental conditions, and public transport performance.

The system simulates real-time infrastructure analytics using dynamic mock data and rule-based predictive logic — without backend dependencies.

---

## Key Features

### Interactive Mumbai Map

* Geographically accurate (OpenStreetMap-based)
* Light minimalist styling
* Layer-based overlay system
* Dynamic infrastructure markers

### Infrastructure Monitoring

* Dam water level & overflow risk prediction
* Bridge structural health monitoring
* Transformer load & failure probability tracking

### Environmental Intelligence

* AQI heatmap
* Area-based pollution breakdown
* Weather overlays
* Traffic intensity visualization

### AI-Driven Insights (Frontend Logic)

* Risk severity calculation
* Confidence meter
* Time-to-impact estimation
* Automatic dashboard state updates

### Role-Based System

* Citizen (view-focused)
* Government Officer (department-based analytics)
* Admin (city-wide oversight)

---

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* MapLibre / Leaflet
* Recharts / Chart.js
* Framer Motion

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/Shadownix-R/Projects.git
cd Projects/MUMBAIkar
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will start locally with hot reloading enabled.

---

## Project Structure

```
MUMBAIkar/
 ├── src/
 │   ├── components/
 │   ├── pages/
 │   ├── hooks/
 │   ├── utils/
 ├── public/
 ├── tailwind.config.ts
 ├── vite.config.ts
```

---

## Future Scope

* Real-time IoT sensor integration
* Municipal API connectivity
* Predictive ML model integration
* Mobile-responsive deployment

---

## License

This project is for educational and demonstration purposes.
