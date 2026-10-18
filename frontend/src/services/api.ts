import axios from 'axios';
import { BoardDetail, BoardSummary, CreateBoardDto, UpdateBoardDto } from '../types';

// In production on Vercel, set VITE_API_BASE_URL in Vercel project environment variables
// Example: https://your-backend.onrender.com/api/v1/boards
const API_BASE_URL =
  import.meta.env.API_BASE_URL || 'http://localhost:8080/api/v1/boards';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const boardApi = {
  /**
   * Fetch all board summaries for the dashboard view
   */
  async getAllBoards(): Promise<BoardSummary[]> {
    const response = await api.get<BoardSummary[]>('');
    return response.data;
  },

  /**
   * Fetch full board details including canvas nodes and edges
   */
  async getBoardById(id: number): Promise<BoardDetail> {
    const response = await api.get<BoardDetail>(`/${id}`);
    return response.data;
  },

  /**
   * Create a new board
   */
  async createBoard(data: CreateBoardDto): Promise<BoardDetail> {
    const response = await api.post<BoardDetail>('', data);
    return response.data;
  },

  /**
   * Autosave / update board metadata and canvas JSON
   */
  async updateBoard(id: number, data: UpdateBoardDto): Promise<BoardDetail> {
    const response = await api.put<BoardDetail>(`/${id}`, data);
    return response.data;
  },

  /**
   * Delete a board permanently
   */
  async deleteBoard(id: number): Promise<void> {
    await api.delete(`/${id}`);
  },

  /**
   * Export the ER diagram from the canvas as a PostgreSQL DDL script
   */
  async exportSql(id: number): Promise<string> {
    const response = await api.post<{ sql: string }>(`/${id}/export-sql`);
    return response.data.sql;
  },

  /**
   * Delete a node from a board and remove connected edges
   */
  async deleteNodeApi(boardId: number, nodeId: string): Promise<BoardDetail> {
    const response = await api.delete<BoardDetail>(`/${boardId}/nodes/${nodeId}`);
    return response.data;
  },
};

export const deleteNodeApi = async (boardId: number, nodeId: string): Promise<BoardDetail> => {
  return boardApi.deleteNodeApi(boardId, nodeId);
};
