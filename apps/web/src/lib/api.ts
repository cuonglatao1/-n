import type { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  User,
  Flow,
  ApiKey,
  UserSettings,
  StreamRequest,
} from '@canvas-llm/shared';

class ApiClient {
  private baseURL: string;
  private getAuthToken: () => string | null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.getAuthToken = () => {
      if (typeof window !== 'undefined') {
        const authData = localStorage.getItem('auth-storage');
        if (authData) {
          const parsed = JSON.parse(authData);
          return parsed.state?.accessToken || null;
        }
      }
      return null;
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();
    console.log('url', url);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile');
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Settings endpoints
  async getSettings(): Promise<ApiResponse<UserSettings>> {
    return this.request<UserSettings>('/settings');
  }

  async addApiKey(apiKeyData: {
    provider: string;
    name: string;
    apiKey: string;
  }): Promise<ApiResponse<ApiKey>> {
    return this.request<ApiKey>('/settings/api-keys', {
      method: 'POST',
      body: JSON.stringify(apiKeyData),
    });
  }

  async updateApiKey(keyId: string, updates: Partial<ApiKey>): Promise<ApiResponse<ApiKey>> {
    return this.request<ApiKey>(`/settings/api-keys/${keyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteApiKey(keyId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/settings/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  }

  // Flow endpoints
  async getFlows(): Promise<ApiResponse<Flow[]>> {
    return this.request<Flow[]>('/flows');
  }

  async getFlow(flowId: string): Promise<ApiResponse<Flow>> {
    return this.request<Flow>(`/flows/${flowId}`);
  }

  async createFlow(flowData: { name: string; description?: string }): Promise<ApiResponse<Flow>> {
    return this.request<Flow>('/flows', {
      method: 'POST',
      body: JSON.stringify(flowData),
    });
  }

  async updateFlow(flowId: string, updates: Partial<Flow>): Promise<ApiResponse<Flow>> {
    return this.request<Flow>(`/flows/${flowId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteFlow(flowId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/flows/${flowId}`, {
      method: 'DELETE',
    });
  }

  // Streaming endpoint
  createStreamingRequest(streamData: StreamRequest): EventSource {
    const token = this.getAuthToken();
    const url = new URL(`${this.baseURL}/llm/stream`);
    
    if (token) {
      url.searchParams.append('token', token);
    }

    const eventSource = new EventSource(url.toString());
    
    // Send the initial request
    fetch(`${this.baseURL}/llm/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(streamData),
    }).catch(console.error);

    return eventSource;
  }
}

export const apiClient = new ApiClient();
