# knitting-app-frontend

Frontend of the Knitting App, a web application for knitters and crocheters that allows importing, translating and adapting knitting patterns. Built with React, Vite and Firebase.

## Prerequisites

- Docker and Docker Compose
- The backend service running (see [knitting-app-backend](https://github.com/knitting-app-tfm/knitting-app-backend))
- A Firebase project (Web API Key)

## Setup

**1. Clone the repository**

```bash
git clone https://github.com/knitting-app-tfm/knitting-app-frontend.git
cd knitting-app-frontend
```

**2. Copy the environment file and fill in the values**

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```
VITE_API_URL=https://localhost:8000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

## Running the project

The frontend is intended to be run together with the backend using Docker Compose. From the backend repository:

```bash
docker-compose up --build
```

The frontend will be available at `http://localhost:5173`.

> **Note:** Since the backend runs with a self-signed HTTPS certificate, you need to open `https://localhost:8000` in your browser once and accept the certificate warning before using the app. Otherwise API calls from the frontend will fail silently.

## Running the tests

```bash
docker-compose exec frontend npm run test
```

To run with coverage:

```bash
docker-compose exec frontend npm run coverage
```

## Project structure

```
src/
  components/    → reusable UI components
  pages/         → full screen pages
  services/      → API calls and Firebase
  context/       → authentication context
  routes/        → React Router configuration
```
