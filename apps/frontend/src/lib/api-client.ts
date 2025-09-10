// API Client - Single responsibility: HTTP communication with backend
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async verifyAuth() {
    return this.request('/auth/verify');
  }

  // Player methods
  async getPlayers(params?: { search?: string; gender?: string; ageGroup?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.gender) searchParams.set('gender', params.gender);
    if (params?.ageGroup) searchParams.set('ageGroup', params.ageGroup);
    
    const query = searchParams.toString();
    return this.request(`/players${query ? `?${query}` : ''}`);
  }

  async getPlayer(id: string) {
    return this.request(`/players/${id}`);
  }

  async createPlayer(data: any) {
    return this.request('/players', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlayer(id: string, data: any) {
    return this.request(`/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlayer(id: string) {
    return this.request(`/players/${id}`, {
      method: 'DELETE',
    });
  }

  // Test methods
  async getTests(params?: { testType?: string; dateFrom?: string; dateTo?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.testType) searchParams.set('testType', params.testType);
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
    
    const query = searchParams.toString();
    return this.request(`/tests${query ? `?${query}` : ''}`);
  }

  async getTest(id: string, includeResults?: boolean) {
    const params = includeResults ? '?includeResults=true' : '';
    return this.request(`/tests/${id}${params}`);
  }

  async createTest(data: any) {
    return this.request('/tests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTest(id: string, data: any) {
    return this.request(`/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTest(id: string) {
    return this.request(`/tests/${id}`, {
      method: 'DELETE',
    });
  }

  // Results methods
  async getResults() {
    return this.request('/results');
  }

  async getPlayerResults(playerId: string) {
    return this.request(`/results/player/${playerId}`);
  }

  async getTestResults(testId: string) {
    return this.request(`/results/test/${testId}`);
  }

  async createResult(data: any) {
    return this.request('/results', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateResult(id: string, data: any) {
    return this.request(`/results/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteResult(id: string) {
    return this.request(`/results/${id}`, {
      method: 'DELETE',
    });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
