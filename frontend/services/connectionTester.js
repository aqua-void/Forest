// services/connectionTester.js

export class ConnectionTester {
  /**
   * Tests the connection to Supabase by listing storage buckets.
   * @param {object} supabase - The Supabase client object.
   * @returns {Promise<{status: 'connected' | 'error' | 'mock_mode', message: string}>}
   */
  static async testSupabaseConnection(supabase) {
    try {
      // NOTE: Accessing internal storage property for testing connection
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        // Supabase error objects have a message property
        throw new Error(error.message || JSON.stringify(error));
      }

      return {
        status: 'connected',
        message: `Connected to Supabase. Buckets: ${data ? data.length : 0}`
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Supabase connection failed: ${error.message}`
      };
    }
  }

  /**
   * Tests the connection to a custom backend health endpoint with a timeout.
   * @param {string} backendUrl - The base URL of the backend.
   * @returns {Promise<{status: 'connected' | 'error' | 'timeout' | 'offline', message: string, responseTime: number}>}
   */
  static async testBackendConnection(backendUrl) {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      // Set a 5-second timeout
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${backendUrl}/health`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          status: 'connected',
          message: 'Backend is responding normally',
          responseTime
        };
      } else {
        return {
          status: 'error',
          message: `Backend responded with status: ${response.status}`,
          responseTime
        };
      }
    } catch (error) {
      // Ensure the timeout is cleared if it wasn't triggered
      // (though clearTimeout works safely on cleared IDs)
      
      const responseTime = Date.now() - startTime;
      
      if (error.name === 'AbortError') {
        return {
          status: 'timeout',
          message: 'Backend request timed out after 5 seconds',
          responseTime
        };
      } else if (error.message && error.message.includes('Failed to fetch')) {
        // This generally indicates network issues or DNS failure (server unreachable)
        return {
          status: 'offline',
          message: 'Backend server is unreachable',
          responseTime
        };
      } else {
        return {
          status: 'error',
          message: `Connection error: ${error.message}`,
          responseTime
        };
      }
    }
  }

  /**
   * Tests all necessary connections (Supabase and custom backend).
   * @param {object} supabase - The Supabase client object.
   * @param {string} backendUrl - The base URL of the backend.
   * @param {boolean} mockMode - Whether the application is running in mock mode.
   * @returns {Promise<{supabase: { status: string; message: string }; backend: { status: string; message: string; responseTime?: number }; allConnected: boolean;}>}
   */
  static async testAllConnections(
    supabase,
    backendUrl,
    mockMode
  ) {
    const supabaseResult = mockMode 
      ? { status: 'mock_mode', message: 'Using mock mode' }
      : await this.testSupabaseConnection(supabase);

    const backendResult = mockMode
      ? { status: 'mock_mode', message: 'Using mock mode' }
      : await this.testBackendConnection(backendUrl);

    return {
      supabase: supabaseResult,
      backend: backendResult,
      // Check if both connections are successful (not in mock mode)
      allConnected: supabaseResult.status === 'connected' && backendResult.status === 'connected'
    };
  }
}