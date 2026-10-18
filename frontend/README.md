# 🎨 Whiteboard Frontend

A modern, responsive, and minimalist visual planning workspace combining To-Do lists, whiteboard sticky notes, and an Entity-Relationship (ER) diagram builder.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **@xyflow/react** (React Flow 12).

---

## 🚀 Features

- 📋 **Dashboard View**: Responsive grid of boards with search filtering, creation modal, and delete options.
- 🎨 **Infinite Canvas**: Smooth pan and zoom powered by `@xyflow/react`.
- ✅ **Interactive To-Do Nodes**: Dynamic checkboxes, progress indicators, and inline task additions.
- 🗄️ **ER Diagram Builder**: Visual database tables with editable columns, SQL data types, primary key flags, and handles for linking relationships.
- 🗒️ **Sticky Notes**: Brainstorming cards with 5 preset pastel and neutral themes.
- 💾 **Debounced Autosave**: Canvas nodes, edges, and viewport positions automatically persist to backend with visual feedback.
- 📤 **SQL DDL Exporter**: Export visual ER diagrams as syntactically valid PostgreSQL schema scripts (`.sql`).
- 🌓 **Class-Based Dark Mode**: Complete dark and light theme support with persistent localStorage state.
- 📱 **Mobile & Touch Friendly**: Collapsible floating dock toolbar and responsive touch gestures.

---

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The application will launch on **http://localhost:5173**.

### 3. Backend Connection

Ensure the Spring Boot backend is running locally on port **8080**:
```bash
# In the root Planner directory:
mvn spring-boot:run
```

The frontend connects directly to `http://localhost:8080/api/v1/boards`.

---

## 📁 Directory Structure

```
frontend/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types/
    │   └── index.ts
    ├── services/
    │   └── api.ts
    ├── context/
    │   └── ThemeContext.tsx
    └── components/
        ├── dashboard/
        │   └── Dashboard.tsx
        └── canvas/
            ├── CanvasPage.tsx
            └── nodes/
                ├── TodoNode.tsx
                ├── ERTableNode.tsx
                └── StickyNoteNode.tsx
```
