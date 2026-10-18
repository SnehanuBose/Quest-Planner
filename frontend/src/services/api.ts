import axios from 'axios';
import {
  AdminUserSummary,
  AuthResponse,
  BoardDetail,
  BoardSummary,
  CreateBoardDto,
  LoginRequest,
  RegisterRequest,
  UpdateBoardDto,
} from '../types';

/**
 * Normalizes the API base URL to ensure clean routing across /auth, /boards, and /admin
 */
const getApiRoot = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  let url = envUrl.trim().replace(/\/+$/, '');

  // If user configured VITE_API_BASE_URL ending with /boards, strip it
  if (url.endsWith('/boards')) {
    url = url.substring(0, url.length - '/boards'.length);
  }

  // Ensure trailing /api/v1
  if (!url.endsWith('/api/v1')) {
    if (url.endsWith('/api')) {
      url = `${url}/v1`;
    } else {
      url = `${url}/api/v1`;
    }
  }
  return url;
};

export const api = axios.create({
  baseURL: getApiRoot(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const TOKEN_STORAGE = {
  ACCESS_TOKEN: 'quest_access_token',
  REFRESH_TOKEN: 'quest_refresh_token',
  LEGACY_TOKEN: 'quest_auth_token',
  USER_DATA: 'quest_auth_user',
};

export const setAuthSession = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem(TOKEN_STORAGE.ACCESS_TOKEN, accessToken);
  localStorage.setItem(TOKEN_STORAGE.LEGACY_TOKEN, accessToken);
  if (refreshToken) {
    localStorage.setItem(TOKEN_STORAGE.REFRESH_TOKEN, refreshToken);
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_STORAGE.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_STORAGE.LEGACY_TOKEN);
  localStorage.removeItem(TOKEN_STORAGE.USER_DATA);
};

// Request Interceptor: Attach JWT Bearer Access Token
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(TOKEN_STORAGE.ACCESS_TOKEN) ||
      localStorage.getItem(TOKEN_STORAGE.LEGACY_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 with Silent Refresh Token Rotation
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 Unauthorized if request exists and hasn't been retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const requestUrl = originalRequest.url || '';

      // Skip refresh attempt on auth endpoints to prevent loops
      if (
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/logout')
      ) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem(TOKEN_STORAGE.REFRESH_TOKEN);
      if (!refreshToken) {
        clearAuthSession();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl = `${getApiRoot()}/auth/refresh`;
        const res = await axios.post<AuthResponse>(refreshUrl, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data;

        setAuthSession(accessToken, newRefreshToken);
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthSession();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Authentication API Endpoints
 */
export const authApi = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(refreshToken?: string | null): Promise<void> {
    try {
      await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } catch {
      // Ignore network errors during logout
    }
  },
};

/**
 * Admin Oversight API Endpoints
 */
export const adminApi = {
  async getUsers(): Promise<AdminUserSummary[]> {
    const response = await api.get<AdminUserSummary[]>('/admin/users');
    return response.data;
  },
};

/**
 * Board & Workspace API Endpoints
 */
export const boardApi = {
  /**
   * Fetch all board summaries for the authenticated user
   */
  async getAllBoards(): Promise<BoardSummary[]> {
    const response = await api.get<BoardSummary[]>('/boards');
    return response.data;
  },

  /**
   * Fetch full board details including canvas nodes and edges
   */
  async getBoardById(id: number): Promise<BoardDetail> {
    const response = await api.get<BoardDetail>(`/boards/${id}`);
    return response.data;
  },

  /**
   * Create a new board owned by the authenticated user
   */
  async createBoard(data: CreateBoardDto): Promise<BoardDetail> {
    const response = await api.post<BoardDetail>('/boards', data);
    return response.data;
  },

  /**
   * Autosave / update board metadata and canvas JSON
   */
  async updateBoard(id: number, data: UpdateBoardDto): Promise<BoardDetail> {
    const response = await api.put<BoardDetail>(`/boards/${id}`, data);
    return response.data;
  },

  /**
   * Delete a board permanently
   */
  async deleteBoard(id: number): Promise<void> {
    await api.delete(`/boards/${id}`);
  },

  /**
   * Delete a node from a board and remove connected edges
   */
  async deleteNodeApi(boardId: number, nodeId: string): Promise<BoardDetail> {
    const response = await api.delete<BoardDetail>(`/boards/${boardId}/nodes/${nodeId}`);
    return response.data;
  },
};

export const deleteNodeApi = async (boardId: number, nodeId: string): Promise<BoardDetail> => {
  return boardApi.deleteNodeApi(boardId, nodeId);
};
