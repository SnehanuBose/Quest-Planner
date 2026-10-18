export interface BoardSummary {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasData {
  nodes: any[];
  edges: any[];
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

export interface ERColumn {
  id: string;
  name: string;
  type: string;
  primaryKey: boolean;
  nullable: boolean;
}

export interface ERTableNodeData {
  label: string;
  columns: ERColumn[];
}

export interface StickyNoteNodeData {
  content: string;
  color: string;
}
