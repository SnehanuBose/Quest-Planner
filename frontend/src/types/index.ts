export interface BoardSummary {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  width: number;
}

export interface ImageNodeData {
  src: string;
  width?: number;
  height?: number;
  rotation?: number; // In degrees, e.g., 0 to 360
  alt?: string;
}

export interface CanvasData {
  nodes: any[];
  edges: any[];
  drawings?: DrawingStroke[];
  viewport?: { x: number; y: number; zoom: number };
}

export interface BoardDetail {
  id: number;
  title: string;
  description: string | null;
  canvasData: CanvasData;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardDto {
  title: string;
  description?: string;
}

export interface UpdateBoardDto {
  title?: string;
  description?: string;
  canvasData?: CanvasData;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoNodeData {
  title: string;
  todos: TodoItem[];
}

export interface StickyNoteNodeData {
  content: string;
  color: string;
}

export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token?: string; // backwards compatibility alias for accessToken
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: Role;
}

export interface AdminUserSummary {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  planCount: number;
}
