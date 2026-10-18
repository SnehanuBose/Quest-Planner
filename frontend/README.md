# 🎨 Quest Planner Frontend

A modern, responsive, and minimalist visual planning workspace combining To-Do sprint lists, whiteboard sticky notes, freehand pen sketching with a customizable color palette, an interactive stroke eraser tool, and resizable, rotatable image nodes.

Styled with a **warm yellowish parchment theme** (`#faf8f2` light / `#12110e` dark) and built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **@xyflow/react** (React Flow 12).

---

## 🚀 Key Features

### 📜 Warm Yellowish & Parchment Aesthetic
- **Warm Parchment Styling**: Atmospheric yellowish parchment canvas (`#faf8f2` / `#12110e`) with golden amber highlights, warm borders (`#e7dfcf` / `#2c271e`), and textured scrollbars.
- **Class-Based Dark Mode**: Complete dark and light theme support synchronized with `localStorage` and OS preference.

### 🔐 Authentication & Dual-Token Architecture
- **Short-Lived Access Tokens (15 min)**: Stateless JWTs containing user claims (`userId`, `username`, `role`) attached automatically to outgoing requests.
- **Long-Lived Refresh Tokens (7 days)**: Stored in `localStorage` (`quest_refresh_token`) and persisted in the database with rotation on every refresh.
- **Silent Axios Interceptor**: On `401 Unauthorized`, automatically queues pending requests, queries `POST /api/v1/auth/refresh`, updates the tokens, and retries the original requests seamlessly without user interruption.
- **Server-Side Logout**: Calling `logout()` revokes the refresh token in PostgreSQL and clears all cached session tokens.
- **Strict Role Security**: Registration window strictly creates standard user accounts (`ROLE_USER`). Administrator privileges (`ROLE_ADMIN`) must be granted directly in PostgreSQL.
- **Protected Routing**: Unauthenticated visitors are routed to `/login`.

### 🛡️ Admin Oversight Dashboard (`/admin`)
- Accessible only by accounts with `ROLE_ADMIN`.
- **Strict Privacy Guard**: Administrators can view user metrics (User ID, Username, Email, Joined Date) and total count of plans created, but are **strictly prevented** from opening, reading, or inspecting user board titles, notes, sketches, images, or canvas data.
- Overview statistics: Total registered users, total plans across the platform, and average activity.

### 🎨 Visual Workspace & Canvas Engine
- **Infinite Canvas**: Smooth pan and zoom powered by `@xyflow/react` (React Flow 12).
- **Custom Site Emblem & Icon**: Replaced default Vite icon with the custom Quest Planner neon sword & compass emblem across favicons and application navigation headers.
- **Freehand Pen Drawing & Color Palette**:
  - Draw, sketch, and write freely across the infinite board.
  - Curated color presets (Amber default, Gold, Emerald, Rose, Sky, Purple, Dark Charcoal, Parchment White) plus a native custom color picker.
  - Stroke width options: Fine (2px), Medium (4px), Thick (6px), Marker (10px).
  - Vector SVG path rendering synchronized with canvas viewport zoom and pan via `ViewportPortal`.
  - Undo last stroke and Clear all drawings controls.
- **Interactive Stroke Eraser Tool**:
  - Real-time line-segment collision detection: drag or click across any drawn stroke to erase it instantly.
  - Custom amber eraser cursor with dedicated eraser status sub-bar and toggle buttons.
  - Automatically syncs canvas state with debounced autosave upon pointer release.
- **Image Nodes (Paste, Reposition, Resize, Rotate)**:
  - **Direct Clipboard Paste**: Press `Ctrl+V` (or `Cmd+V`) anywhere on the board to instantly paste an image.
  - **File Upload**: Dedicated "+ Image" toolbar button with file picker.
  - **Repositioning**: Native draggable node physics.
  - **Multi-Directional Resizing**: Integrated `<NodeResizer>` controls on corners and edges when selected.
  - **Smooth Rotation (`0° - 360°`)**: Interactive top handle knob for drag-to-rotate, +/-15° step buttons, and a smooth continuous rotation slider isolated from canvas dragging via `nodrag`/`nopan`.
  - **Individual Card Deletion**: Top-right trash button with cascading edge cleanup.
- **Interactive To-Do Nodes**: Real-time task progress bars, inline editing, and a top-right **delete card** button.
- **Sticky Notes**: Brainstorming cards featuring 5 pastel/neutral themes with an inline delete button.
- **Debounced Autosave**: Changes to board title, nodes, edges, drawings, and eraser actions persist automatically 1.5 seconds after editing.

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `frontend` root (optional for local dev):
```bash
# Optional: defaults to http://localhost:8080/api/v1/boards
VITE_API_BASE_URL=http://localhost:8080/api/v1/boards
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch on **http://localhost:5173**.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized, tree-shaken static production bundle in `dist/`.

---

## 📁 Directory Structure

```
frontend/
├── index.html                   # HTML entry point with Inter & JetBrains Mono fonts
├── package.json                 # Dependencies: @xyflow/react, axios, lucide-react, tailwindcss
├── tailwind.config.js           # Tailwind theme tokens & dark mode configuration
├── tsconfig.json                # TypeScript compiler settings
├── vite.config.ts               # Vite configuration with local /api proxy
├── vercel.json                  # SPA rewrite rules for Vercel deployment
└── src/
    ├── App.tsx                  # Client router, protected routes, and auth gating
    ├── main.tsx                 # Application DOM mount
    ├── index.css                # Custom scrollbars, dialog styling, and React Flow tokens
    ├── vite-env.d.ts            # Environment variable type declarations
    ├── types/
    │   └── index.ts             # TypeScript interfaces (User, Auth, Canvas, Drawing, Image, Board)
    ├── services/
    │   └── api.ts               # Axios client with JWT request/response interceptors
    ├── context/
    │   ├── AuthContext.tsx      # JWT authentication and user role state provider
    │   └── ThemeContext.tsx     # Persistent dark/light theme provider
    └── components/
        ├── auth/
        │   ├── LoginPage.tsx    # Sign-in form
        │   └── RegisterPage.tsx # Account registration with role selection
        ├── admin/
        │   └── AdminDashboardPage.tsx # Privacy-guarded user oversight table
        ├── dashboard/
        │   └── Dashboard.tsx    # User board grid, creation modal, and navbar
        └── canvas/
            ├── CanvasPage.tsx   # React Flow canvas, docked toolbar, freehand pen SVG layer
            └── nodes/
                ├── TodoNode.tsx       # Checklist node with delete button
                ├── StickyNoteNode.tsx # Sticky note node with delete button
                └── ImageNode.tsx      # Resizable, rotatable image card
```

---

## ☁️ Vercel Deployment

1. Import the repository into **Vercel**.
2. Set the **Root Directory** to `frontend`.
3. Set Framework Preset to **Vite**.
4. In Environment Variables, add:
   * `VITE_API_BASE_URL`: `https://<your-render-backend-url>.onrender.com/api/v1/boards`
5. Click **Deploy**. SPA routes (`/login`, `/register`, `/admin`) are handled seamlessly via `vercel.json`.
