<div align="center">

# 🎨 Whiteboard Backend API

**A production-grade REST API for a visual workspace combining To-Do lists, a freeform whiteboard, and an ER diagram builder.**

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Local Setup](#-local-setup)
- [API Endpoints](#-api-endpoints)
- [Sample Payloads](#-sample-payloads)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)

---

## 🔍 Overview

The **Whiteboard Backend** powers a visual workspace application where users can:

- ✅ **Create and manage To-Do lists** directly on the canvas
- 🗒️ **Place sticky notes** for freeform brainstorming
- 🗄️ **Design Entity-Relationship diagrams** with tables, columns, and relationships
- 🔗 **Connect nodes with edges** to define visual and logical relationships
- 📤 **Export ER diagrams** as executable PostgreSQL SQL scripts

All canvas data — nodes, edges, and their positions — is stored as a native PostgreSQL `jsonb` column, enabling flexible schema-less storage with full query capabilities.

---

## 🏗️ Architecture

The application follows **clean architecture** principles with strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                    │
│                    http://localhost:5173                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BoardController                           │
│              HTTP Orchestration & Validation                 │
├─────────────────────────────────────────────────────────────┤
│              BoardService  │  SqlExportService               │
│           Business Logic   │  DDL Generation                 │
├─────────────────────────────────────────────────────────────┤
│                    BoardRepository                           │
│                Spring Data JPA + Hibernate                   │
├─────────────────────────────────────────────────────────────┤
│                 PostgreSQL (jsonb storage)                   │
│                 jdbc:postgresql://localhost:5432              │
└─────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **DTO Pattern**: Request/Response DTOs isolate the API contract from internal entity structure
- **JSONB Storage**: Canvas data lives in a single `jsonb` column, avoiding complex relational joins for dynamic visual data
- **Partial Updates**: PUT endpoints support partial updates for efficient autosave from the frontend
- **Lightweight Summaries**: Dashboard listings omit heavy canvas data via a dedicated summary DTO

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Java 21 LTS** | Language runtime |
| **Spring Boot 3.3.5** | Application framework |
| **Spring Web MVC** | REST API layer |
| **Spring Data JPA** | Data access abstraction |
| **Hibernate 6** | ORM with native JSONB support |
| **PostgreSQL** | Relational database with JSONB |
| **Jakarta Validation** | Request payload validation |
| **Project Lombok** | Boilerplate reduction |
| **HikariCP** | Connection pooling (default) |
| **Maven** | Build & dependency management |

---

## 📦 Prerequisites

Before running the project, ensure you have:

- ☕ **Java 21** — [Download OpenJDK](https://adoptium.net/)
- 🐘 **PostgreSQL 14+** — Running locally on port `5432`
- 🔧 **Maven 3.9+** — [Download Maven](https://maven.apache.org/download.cgi)

---

## 🚀 Local Setup

### Step 1: Create the Database

Using **psql**:
```bash
psql -U postgres
CREATE DATABASE whiteboard_db;
\q
```

Or using **pgAdmin**:
1. Right-click "Databases" → "Create" → "Database..."
2. Name: `whiteboard_db`
3. Owner: `postgres`
4. Click "Save"

### Step 2: Configure Credentials

Edit `src/main/resources/application.yml` to match your PostgreSQL credentials:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/whiteboard_db
    username: postgres     # ← Your PostgreSQL username
    password: postgres     # ← Your PostgreSQL password
```

### Step 3: Build & Run

```bash
# Clone and navigate to the project
cd whiteboard-backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will start on **http://localhost:8080**.

### Step 4: Verify

```bash
curl http://localhost:8080/api/v1/boards
# Expected: []
```

---

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1/boards`.

| Method | Path | Request Body | Response Code | Description |
|--------|------|-------------|---------------|-------------|
| `GET` | `/api/v1/boards` | — | `200 OK` | List all board summaries (lightweight, no canvas data) |
| `GET` | `/api/v1/boards/{id}` | — | `200 OK` | Get full board details with canvas data |
| `POST` | `/api/v1/boards` | `CreateBoardRequest` | `201 Created` | Create a new board with empty canvas |
| `PUT` | `/api/v1/boards/{id}` | `UpdateBoardRequest` | `200 OK` | Update board title, description, and/or canvas |
| `DELETE` | `/api/v1/boards/{id}` | — | `204 No Content` | Delete a board permanently |
| `POST` | `/api/v1/boards/{id}/export-sql` | — | `200 OK` | Export ER diagram as PostgreSQL DDL script |

### Error Responses

All errors follow a consistent structure:

```json
{
  "timestamp": "2026-10-18T09:30:00",
  "status": 404,
  "message": "Board not found with id: '42'",
  "path": "/api/v1/boards/42"
}
```

---

## 📝 Sample Payloads

### ➕ Create a Board

**Request:** `POST /api/v1/boards`
```json
{
  "title": "My Database Design",
  "description": "ER diagram for the e-commerce platform"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "My Database Design",
  "description": "ER diagram for the e-commerce platform",
  "canvasData": {
    "nodes": [],
    "edges": []
  },
  "createdAt": "2026-10-18T09:30:00",
  "updatedAt": "2026-10-18T09:30:00"
}
```

### ✏️ Update a Board (Autosave with ER Tables)

**Request:** `PUT /api/v1/boards/1`
```json
{
  "title": "E-Commerce DB Schema",
  "canvasData": {
    "nodes": [
      {
        "id": "node-1",
        "type": "erTable",
        "position": { "x": 100, "y": 200 },
        "data": {
          "label": "users",
          "columns": [
            { "name": "id", "type": "SERIAL", "primaryKey": true, "nullable": false },
            { "name": "email", "type": "VARCHAR(255)", "primaryKey": false, "nullable": false },
            { "name": "name", "type": "VARCHAR(100)", "primaryKey": false, "nullable": true }
          ]
        }
      },
      {
        "id": "node-2",
        "type": "erTable",
        "position": { "x": 500, "y": 200 },
        "data": {
          "label": "orders",
          "columns": [
            { "name": "id", "type": "SERIAL", "primaryKey": true, "nullable": false },
            { "name": "user_id", "type": "INTEGER", "primaryKey": false, "nullable": false },
            { "name": "total", "type": "DECIMAL(10,2)", "primaryKey": false, "nullable": false },
            { "name": "created_at", "type": "TIMESTAMP", "primaryKey": false, "nullable": false }
          ]
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node-2",
        "target": "node-1",
        "data": {
          "sourceColumn": "user_id",
          "targetColumn": "id"
        }
      }
    ]
  }
}
```

### 📤 Export SQL

**Request:** `POST /api/v1/boards/1/export-sql`

**Response:** `200 OK`
```json
{
  "sql": "-- ============================================\n-- Generated PostgreSQL Schema\n-- Exported from Whiteboard ER Diagram Builder\n-- ============================================\n\nCREATE TABLE users (\n    id                             SERIAL,\n    email                          VARCHAR(255) NOT NULL,\n    name                           VARCHAR(100),\n    CONSTRAINT pk_users PRIMARY KEY (id)\n);\n\nCREATE TABLE orders (\n    id                             SERIAL,\n    user_id                        INTEGER NOT NULL,\n    total                          DECIMAL(10,2) NOT NULL,\n    created_at                     TIMESTAMP NOT NULL,\n    CONSTRAINT pk_orders PRIMARY KEY (id)\n);\n\n-- Foreign Key Constraints\n-- ============================================\n\nALTER TABLE orders\n    ADD CONSTRAINT fk_orders_users_1\n    FOREIGN KEY (user_id) REFERENCES users (id);\n"
}
```

---

## 📁 Project Structure

```
com.whiteboard.backend
├── config/
│   └── CorsConfig.java                 # Global CORS configuration
├── controller/
│   └── BoardController.java            # REST endpoints for board CRUD & SQL export
├── dto/
│   ├── request/
│   │   ├── CreateBoardRequest.java     # Validated DTO for board creation
│   │   └── UpdateBoardRequest.java     # Partial update DTO for autosave
│   └── response/
│       ├── BoardResponse.java          # Full board detail response
│       ├── BoardSummaryResponse.java   # Lightweight dashboard listing DTO
│       └── ErrorResponse.java          # Standardized error payload
├── entity/
│   └── Board.java                      # JPA entity with JSONB canvas data
├── exception/
│   ├── GlobalExceptionHandler.java     # Centralized @RestControllerAdvice
│   └── ResourceNotFoundException.java # Custom 404 exception
├── repository/
│   └── BoardRepository.java           # Spring Data JPA repository
├── service/
│   ├── BoardService.java              # Business logic interface
│   ├── SqlExportService.java          # SQL generation interface
│   └── impl/
│       ├── BoardServiceImpl.java      # Board lifecycle implementation
│       └── SqlExportServiceImpl.java  # ER-to-SQL parser implementation
└── BackendApplication.java            # Spring Boot entry point
```

---

## ⚙️ Configuration

Key configuration in `application.yml`:

| Property | Default | Description |
|----------|---------|-------------|
| `server.port` | `8080` | API server port |
| `spring.datasource.url` | `jdbc:postgresql://localhost:5432/whiteboard_db` | Database URL |
| `spring.datasource.username` | `postgres` | Database username |
| `spring.datasource.password` | `postgres` | Database password |
| `spring.jpa.hibernate.ddl-auto` | `update` | Schema auto-generation mode |
| `cors.allowed-origins` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins |
| `cors.max-age` | `3600` | CORS preflight cache duration (seconds) |

---

<div align="center">

**Built with ❤️ using Spring Boot & PostgreSQL**

</div>
