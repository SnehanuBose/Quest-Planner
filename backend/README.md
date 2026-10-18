<div align="center">

# 🎨 Quest Planner Backend API

**A production-grade REST API for a visual workspace combining To-Do sprint lists, whiteboard sticky notes, freehand pen sketches, and resizable, rotatable image nodes.**

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![JWT](https://img.shields.io/badge/JWT-JJWT_0.12-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://github.com/jwtk/jjwt)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture & Security](#-architecture--security)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Strict Privacy Guard](#-strict-privacy-guard)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Local Setup](#-local-setup)
- [API Endpoints](#-api-endpoints)
- [Sample Payloads](#-sample-payloads)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Docker & Cloud Deployment](#-docker--cloud-deployment)

---

## 🔍 Overview

The **Quest Planner Backend** powers a visual planning application where users can:

- 🔐 **Register & Login** with secure JWT token authentication and BCrypt password encryption.
- 🔒 **Private Boards**: Create, view, update, autosave, and delete boards owned strictly by the authenticated user.
- 🗑️ **Delete Specific Nodes**: Remove individual task lists, images, or sticky notes with automatic cascading edge deletion.
- ✏️ **Drawings & Freehand Sketches**: Persist vector strokes, color palettes, and widths directly within board canvas data.
- 🖼️ **Image Boards**: Store resizable, rotatable image node structures and metadata.
- 🛡️ **Admin Oversight**: Administrators can view user counts and platform statistics without compromising user privacy.

All canvas data — nodes, edges, vector drawings, and their viewport coordinates — is stored in a native PostgreSQL `jsonb` column.

---

## 🏗️ Architecture & Security

The backend is built on **clean architecture** and strict separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                    │
│                 http://localhost:5173 / Vercel               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST + Bearer <token>
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Spring Security 6                        │
│   CorsFilter ──► JwtAuthenticationFilter ──► SecurityContext│
├─────────────────────────────────────────────────────────────┤
│                    Controller Layer                         │
│   AuthController │ BoardController │ AdminController        │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer                           │
│   AuthService │ BoardService │ AdminService                 │
├─────────────────────────────────────────────────────────────┤
│                    Repository Layer                         │
│           UserRepository │ BoardRepository                  │
├─────────────────────────────────────────────────────────────┤
│                 PostgreSQL (JSONB Storage)                  │
│       `users` table (credentials)                           │
│       `boards` table (`user_id` FK + native `canvas_data`)  │
└─────────────────────────────────────────────────────────────┘
```

**Key Architectural Decisions:**
- **Stateless Session Management**: Authentication is fully stateless using signed JWTs (HMAC-SHA256).
- **User Ownership Isolation**: Every board query is filtered through `SecurityUtils.getCurrentUserId()`. Any attempt to access another user's board ID returns `404 Not Found`.
- **JSONB Canvas Mapping**: Visual nodes, edges, and drawings live in PostgreSQL `jsonb`, mapped with Hibernate 6 `@JdbcTypeCode(SqlTypes.JSON)`.
- **Preflight CORS Integration**: `CorsConfigurationSource` is exposed as a Spring Bean, guaranteeing seamless preflight (`OPTIONS`) handling for Vercel preview and production domains.

---

## 🛡️ Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| **`ROLE_USER`** | Register, log in, create boards, view/update/delete strictly their own boards. Assigned by default on registration. |
| **`ROLE_ADMIN`** | Log in, access the Admin Oversight Dashboard (`GET /api/v1/admin/users`) to review registered user metadata and total plan counts. |

### 🔑 Database-Enforced Admin Provisioning
To uphold strict system security, the account creation endpoint and registration UI **only create standard `ROLE_USER` accounts**. Admin privileges cannot be requested or chosen at registration.

To elevate a user to `ROLE_ADMIN`, run the following SQL update directly on the database:
```sql
UPDATE users
SET role = 'ROLE_ADMIN'
WHERE username = '<target-username>';
```

---

## 🔒 Strict Privacy Guard

To ensure maximum confidentiality for personal and enterprise projects:
* Administrators **CANNOT** view, open, read, edit, or inspect any user's board titles, sticky notes, task items, sketches, or images.
* The Admin endpoint returns only non-sensitive user identity attributes and an aggregated `planCount`:
  ```json
  [
    {
      "id": 1,
      "username": "alice",
      "email": "alice@example.com",
      "role": "ROLE_USER",
      "createdAt": "2026-10-18T10:00:00",
      "planCount": 4
    }
  ]
  ```

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|---|---|---|
| **Java** | High-performance, memory-safe LTS runtime | `21` |
| **Spring Boot** | Application framework | `3.3.5` |
| **Spring Security** | Stateless auth & method-level security | `6.x` |
| **JJWT (io.jsonwebtoken)** | Token generation & verification | `0.12.6` |
| **Spring Data JPA** | Object-relational mapping & repository layer | `3.3.5` |
| **Hibernate 6** | JPA provider with native JSONB dialect | `6.5.x` |
| **PostgreSQL Driver** | JDBC connectivity with Neon / local Postgres | `42.7.4` |
| **HikariCP** | High-throughput connection pooling | `Default` |
| **Jakarta Validation** | Declarative bean validation (`@NotBlank`, `@Size`) | `3.0.x` |
| **Project Lombok** | Eliminates boilerplate (`@Data`, `@Builder`) | `1.18.x` |

---

## 📦 Prerequisites

Ensure you have the following installed locally:
- ☕ **Java 21 LTS** — [Adoptium Temurin 21](https://adoptium.net/)
- 🐘 **PostgreSQL 14+** (or a cloud [Neon](https://neon.tech) connection)
- 🔧 **Maven 3.9+**

---

## 🚀 Local Setup

### 1. Database Creation
```bash
psql -U postgres
CREATE DATABASE whiteboard_db;
\q
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or set environment variables:
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/whiteboard_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION=86400000
CORS_ALLOWED_ORIGIN_PATTERNS=http://localhost:5173,http://localhost:3000
```

### 3. Build & Run
```bash
# Build the application
mvn clean package -DskipTests

# Run the Spring Boot server
mvn spring-boot:run
```
The application will launch on **http://localhost:8080**.

---

## 📡 API Endpoints

### 1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register new user with username, email, password, and optional role |
| `POST` | `/api/v1/auth/login` | Public | Authenticate credentials and receive signed Bearer JWT |

### 2. Admin Oversight (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/users` | `ROLE_ADMIN` | Summary list of registered users and plan counts (Strict Privacy Guard) |

### 3. Boards (`/api/v1/boards`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/boards` | Authenticated | List all board summaries owned by current user |
| `GET` | `/api/v1/boards/{id}` | Authenticated | Get full details & canvas data for owned board |
| `POST` | `/api/v1/boards` | Authenticated | Create a new board owned by current user |
| `PUT` | `/api/v1/boards/{id}` | Authenticated | Autosave / partial update of title, description, nodes, edges & drawings |
| `DELETE` | `/api/v1/boards/{id}` | Authenticated | Delete a board permanently |
| `DELETE` | `/api/v1/boards/{id}/nodes/{nodeId}` | Authenticated | Delete single node from board and cascade attached edges |

---

## 📝 Sample Payloads

### ➕ Create a Board
**Request**: `POST /api/v1/boards`
```json
{
  "title": "Sprint 42 Architecture",
  "description": "Visual planning canvas"
}
```

### ✏️ Update a Board (Autosave with Nodes & Drawings)
**Request**: `PUT /api/v1/boards/1`
```json
{
  "title": "Sprint 42 Architecture",
  "canvasData": {
    "nodes": [
      {
        "id": "todo-1",
        "type": "todoNode",
        "position": { "x": 100, "y": 150 },
        "data": {
          "title": "Sprint Tasks",
          "todos": [{ "id": "1", "text": "Deploy to Render", "completed": true }]
        }
      },
      {
        "id": "image-1",
        "type": "imageNode",
        "position": { "x": 400, "y": 150 },
        "data": {
          "src": "data:image/png;base64,...",
          "rotation": 15
        }
      }
    ],
    "edges": [],
    "drawings": [
      {
        "id": "stroke-1",
        "points": [{ "x": 100, "y": 100 }, { "x": 120, "y": 110 }],
        "color": "#6366f1",
        "width": 4
      }
    ]
  }
}
```

---

## 📁 Project Structure

```
backend/
├── pom.xml
├── Dockerfile
├── .env.example
├── README.md
└── src/main/java/com/whiteboard/backend/
    ├── BackendApplication.java
    ├── config/
    │   ├── CorsConfig.java
    │   └── SecurityConfig.java
    ├── controller/
    │   ├── AdminController.java
    │   ├── AuthController.java
    │   └── BoardController.java
    ├── dto/
    │   ├── request/
    │   │   ├── CreateBoardRequest.java
    │   │   ├── LoginRequest.java
    │   │   ├── RegisterRequest.java
    │   │   └── UpdateBoardRequest.java
    │   └── response/
    │       ├── AdminUserSummaryResponse.java
    │       ├── AuthResponse.java
    │       ├── BoardResponse.java
    │       ├── BoardSummaryResponse.java
    │       └── ErrorResponse.java
    ├── entity/
    │   ├── Board.java
    │   ├── Role.java
    │   └── User.java
    ├── exception/
    │   ├── GlobalExceptionHandler.java
    │   └── ResourceNotFoundException.java
    ├── repository/
    │   ├── BoardRepository.java
    │   └── UserRepository.java
    ├── security/
    │   ├── CustomUserDetails.java
    │   ├── CustomUserDetailsService.java
    │   ├── JwtAuthenticationEntryPoint.java
    │   ├── JwtAuthenticationFilter.java
    │   ├── JwtTokenProvider.java
    │   └── SecurityUtils.java
    └── service/
        ├── AdminService.java
        ├── AuthService.java
        ├── BoardService.java
        └── impl/
            ├── AdminServiceImpl.java
            ├── AuthServiceImpl.java
            └── BoardServiceImpl.java
```

---

## 🐳 Docker & Cloud Deployment

### Docker Multi-Stage Build
The included [`Dockerfile`](Dockerfile) packages the Spring Boot application into a lightweight Alpine JRE 21 container:
```bash
docker build -t quest-planner-backend .
docker run -p 8080:8080 -e SPRING_DATASOURCE_URL=... quest-planner-backend
```

### Deploying to Render
1. Create a new **Web Service** on Render connected to your Git repository.
2. Set the **Root Directory** to `backend`.
3. Choose the **Docker** environment (or Maven runtime).
4. Add the required environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGIN_PATTERNS`).
