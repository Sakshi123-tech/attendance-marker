# Attendance Marker Application

This is the complete Dockerized environment for the Smart Attendance & Access Management Application. It contains a React/Vite frontend, a Node.js/Express backend, and a MongoDB database, all fully containerized and orchestrated using Docker Compose.

## Architecture Overview

- **Frontend (`attendance-frontend`)**: React application running on Vite (Port 5173).
- **Backend (`attendance-backend`)**: Express.js server providing the REST API (Port 5000).
- **Database (`attendance-mongodb`)**: Persistent MongoDB 7 container for application data (Port 27017).
- **Network (`attendance-network`)**: A custom Docker bridge network ensuring seamless and secure communication between the backend and the database.

## Prerequisites
- Docker
- Docker Compose (usually included with Docker Desktop)

---

## 🚀 Running the Full Stack

To build and start all containers simultaneously in the background, run:

```bash
docker compose up --build -d
```
*Note: The `--build` flag ensures your images are built freshly from your source code. The `-d` flag runs them in detached mode (background).*

---

## 🛠 Useful Docker Compose Commands

### Stop the application
Stops all running containers without destroying the persistent MongoDB data volume:
```bash
docker compose down
```

### View Logs
Check logs for all services:
```bash
docker compose logs -f
```
Check logs for a specific service:
```bash
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb
```

### Restart a specific service
If you make a change that requires a hard restart:
```bash
docker compose restart backend
```

### Check running status
To verify which containers are currently active and their port mappings:
```bash
docker compose ps
```

---

## Data Persistence

The MongoDB database utilizes a named Docker volume (`mongo-data`). This ensures that your attendance records, user profiles, and configurations persist even if the containers are stopped or completely removed!
