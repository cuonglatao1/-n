import type { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest, 
  VerifyEmailRequest,
  ResendVerificationRequest,
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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

  async verifyEmail(verifyData: VerifyEmailRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(verifyData),
    });
  }

  async resendVerification(resendData: ResendVerificationRequest): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify(resendData),
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

  async generateText(
    provider: string,
    prompt: string,
    model?: string
  ): Promise<ApiResponse<{ success: boolean; data: string }>> {
    return await this.request<{ success: boolean; data: string }>('/llm/generate-text', {
      method: 'POST',
      body: JSON.stringify({ provider, prompt, model }),
    });
  }

  async streamText(
    provider: string,
    prompt: string,
    model?: string,
    onToken?: (token: string) => void,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    const url = `${this.baseURL}/llm/stream-text`;
    const token = this.getAuthToken();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ provider, prompt, model, history }),
    });
    if (!response.ok || !response.body) {
      throw new Error('Stream request failed');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      full += chunk;
      onToken?.(chunk);
    }
    return full;
  }
}

export const apiClient = new ApiClient();
