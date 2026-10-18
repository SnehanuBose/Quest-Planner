<div align="center">

#  Quest Planner

<p align="center">
  Quest Planner is a minimalist, developer-focused visual workspace that bridges the gap between daily execution and system architecture. Instead of juggling separate apps for your to-do checklists, sticky-note brainstorms, and database diagrams, Quest Planner unites them on one infinite board.
</p>

---

<!-- Badges & Tech Stack Logos -->
<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-21_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Monorepo Structure](#-monorepo-structure)
- [Key Features](#-key-features)
- [Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Subproject Documentation](#-subproject-documentation)
- [API Overview](#-api-overview)
- [Contributing & License](#-contributing--license)

---

## 🔍 Overview

**Whiteboard Planner** is architected to give developers, systems architects, and product teams a single infinite canvas to brainstorm, track sprints, and model database architectures.

- **Checklists & Sprint Tracking**: Interactive To-Do nodes with live completion progress bars.
- **Relational Data Modeling**: ER Diagram table nodes with field definitions, SQL data types, primary key flags, and draggable relationship edges.
- **DDL Code Generation**: Instantly parses ER tables and relational edges from the canvas tree and outputs syntactically valid PostgreSQL DDL (`CREATE TABLE`, primary keys, and foreign keys).
- **Freeform Brainstorming**: Sticky notes featuring 5 color palettes with auto-expanding text fields.
- **Zero-Friction Autosave**: Debounced background persistence preserving canvas zoom, positions, nodes, and edges directly into native PostgreSQL `jsonb`.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Frontend (Client Layer)                         │
│             React 18 + TypeScript + Vite + Tailwind CSS                │
│                 Infinite Canvas: @xyflow/react (v12)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (Axios)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Backend (Service Layer)                         │
│                    Spring Boot 3.3.5 (Java 21 LTS)                     │
│    Controllers ──► DTOs ──► Business Services ──► SqlExportService     │
├────────────────────────────────────────────────────────────────────────┤
│                      Persistence & Data Access                         │
│             Spring Data JPA + Hibernate 6 Native JSONB                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JDBC / HikariCP
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL Database                            │
│           Local Instance (localhost:5432) or Serverless Neon           │
│           `boards` table with native JSONB `canvas_data` column        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Monorepo Structure

```
Planner/
├── 📄 README.md                 # 🌟 Master project documentation (you are here)
├── 📄 .gitignore                # Global gitignore covering Java, Maven, Node, and IDEs
│
├── 📁 Backend/                  # ☕ Spring Boot REST API
│   ├── pom.xml                  # Maven dependencies & build configuration
│   ├── README.md                # 📖 Detailed Backend architecture & setup guide
│   └── src/
│       ├── main/java/com/whiteboard/backend/
│       │   ├── BackendApplication.java
│       │   ├── config/          # Global CORS configuration
│       │   ├── controller/      # REST endpoints (/api/v1/boards)
│       │   ├── dto/             # Request & Response DTOs
│       │   ├── entity/          # JPA Board entity with JSONB mapping
│       │   ├── exception/       # Centralized @RestControllerAdvice
│       │   ├── repository/      # Spring Data JPA repository
│       │   └── service/         # BoardService & SqlExportService implementations
│       └── main/resources/
│           └── application.yml  # Database datasource, JPA & CORS settings
│
└── 📁 frontend/                 # ⚛️ React 18 + Vite Web Application
    ├── package.json             # NPM dependencies & scripts
    ├── README.md                # 📖 Detailed Frontend UI/UX guide
    ├── vite.config.ts           # Vite server & API proxy config
    ├── tailwind.config.js       # Tailwind CSS with class-based dark mode
    └── src/
        ├── App.tsx              # Application root & client router
        ├── main.tsx             # DOM mount & stylesheet initialization
        ├── index.css            # Custom design tokens, scroll containment & React Flow CSS
        ├── types/               # Strict TypeScript definitions
        ├── services/            # Axios API client
        ├── context/             # ThemeContext (dark/light mode persistence)
        └── components/
            ├── dashboard/       # Dashboard view & board creation modal
            └── canvas/          # CanvasPage & custom nodes (Todo, ERTable, StickyNote)
```

---

## ✨ Key Features

| Domain | Feature | Description |
|---|---|---|
| **Canvas** | **Infinite Workspace** | Pan, zoom, and multi-touch support powered by `@xyflow/react`. |
| **Canvas** | **Docked Toolbar** | Quick-add controls for To-Do Lists, ER Tables, and Sticky Notes with responsive collapse. |
| **Data** | **PostgreSQL JSONB** | Stores node graphs, edges, and viewport positions inside a native `jsonb` column. |
| **SQL** | **Schema Exporter** | Parses ER table nodes and connecting edges into executable PostgreSQL scripts (`.sql`). |
| **UI/UX** | **Linear / Notion Aesthetic** | Muted neutral tones, subtle borders, and smooth transitions. |
| **Theme** | **Class-based Dark Mode** | Persistent theme toggle synchronized with `localStorage` and OS preference. |
| **Sync** | **Debounced Autosave** | Automatically updates the backend 1.5s after user movement or text input. |

---

## 🚀 Quick Start Guide

### Prerequisites
* ☕ **Java 21 LTS** (Amazon Corretto, Eclipse Temurin, or Oracle JDK)
* 🐘 **PostgreSQL 14+** (Local native service or [Neon Serverless Postgres](https://neon.tech))
* 🟢 **Node.js 18+** & **npm**

---

### 1. Backend Setup

1. **Create the PostgreSQL Database**:
   ```sql
   CREATE DATABASE whiteboard_db;
   ```

2. **Configure Database Credentials**:
   Edit [`Backend/src/main/resources/application.yml`](Backend/src/main/resources/application.yml) to match your PostgreSQL credentials:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/whiteboard_db
       username: postgres
       password: your_password
   ```

3. **Build & Run the Backend**:
   ```bash
   cd Backend
   mvn clean spring-boot:run
   ```
   *The REST API will boot up on **http://localhost:8080**.*

---

### 2. Frontend Setup

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   *The frontend will launch at **http://localhost:5173** and automatically proxy API calls to port 8080.*

---

## 📖 Subproject Documentation

For deep-dive documentation on each respective module, check out their dedicated guides:

| Module | Documentation Link | Highlights |
|---|---|---|
| ☕ **Backend** | [**Backend/README.md**](Backend/README.md) | JPA entity mapping, REST endpoints, exception handling, SQL export parser, and HikariCP pooling. |
| ⚛️ **Frontend** | [**frontend/README.md**](frontend/README.md) | Custom React Flow nodes, Tailwind styling tokens, modal scroll containment, and autosave state machine. |

---

## 📡 API Overview

Base URL: `http://localhost:8080/api/v1/boards`

| Method | Endpoint | Request Body | Description |
|---|---|---|---|
| `GET` | `/api/v1/boards` | — | Fetch lightweight board summaries for dashboard listing |
| `GET` | `/api/v1/boards/{id}` | — | Fetch full board details including complete canvas JSON |
| `POST` | `/api/v1/boards` | `CreateBoardRequest` | Create a new board with default empty canvas |
| `PUT` | `/api/v1/boards/{id}` | `UpdateBoardRequest` | Update title, description, or autosave canvas nodes & edges |
| `DELETE`| `/api/v1/boards/{id}` | — | Permanently delete a board and its canvas data |
| `POST` | `/api/v1/boards/{id}/export-sql` | — | Export ER diagram as downloadable PostgreSQL DDL |

---

## 🤝 Contributing & License

This project is licensed under the **MIT License**. Contributions, issues, and feature requests are welcome!
