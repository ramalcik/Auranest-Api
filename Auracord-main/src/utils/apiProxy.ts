
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  sessionId: string;
}

class ApiProxy {
  private static instance: ApiProxy;
  private sessionId: string;
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private readonly RATE_LIMIT_WINDOW = 60000; 
  private readonly MAX_REQUESTS_PER_WINDOW = 10;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): ApiProxy {
    if (!ApiProxy.instance) {
      ApiProxy.instance = new ApiProxy();
    }
    return ApiProxy.instance;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    

    if (now - this.lastRequestTime > this.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }


    if (this.requestCount >= this.MAX_REQUESTS_PER_WINDOW) {
      return false;
    }

    this.requestCount++;
    return true;
  }

  private validateRequest(): boolean {

    if (typeof window !== 'undefined') {
      const referer = document.referrer;
      const currentOrigin = window.location.origin;
      
 
      if (!referer || !referer.startsWith(currentOrigin)) {
        return false;
      }
    }


    if (!this.checkRateLimit()) {
      return false;
    }

    return true;
  }

  public async fetchUserData(userId: string): Promise<ApiResponse<any>> {
    try {
   
      if (!this.validateRequest()) {
        return {
          success: false,
          error: 'Unauthorized access or rate limit exceeded',
          timestamp: Date.now(),
          sessionId: this.sessionId
        };
      }

 
      const response = await fetch(`/api/user?id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId,
          'X-Request-Timestamp': Date.now().toString(),
          'X-Client-Origin': window.location.origin,
        },
        credentials: 'same-origin'
      });

   
      if (response.status === 403 || response.status === 429) {
        await response.text(); 
        return {
          success: false,
          error: `API Error: ${response.status}`,
          timestamp: Date.now(),
          sessionId: this.sessionId
        };
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
        timestamp: Date.now(),
        sessionId: this.sessionId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        sessionId: this.sessionId
      };
    }
  }


  public getSessionInfo() {
    return {
      sessionId: this.sessionId,
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime
    };
  }


  public getRateLimitStatus() {
    const now = Date.now();
    const timeRemaining = Math.max(0, this.RATE_LIMIT_WINDOW - (now - this.lastRequestTime));
    
    return {
      remainingRequests: Math.max(0, this.MAX_REQUESTS_PER_WINDOW - this.requestCount),
      timeRemaining,
      isLimited: this.requestCount >= this.MAX_REQUESTS_PER_WINDOW
    };
  }
}

export default ApiProxy;
