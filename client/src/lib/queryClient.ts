import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// CSRF token cache
let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

// Fetch CSRF token from server
async function fetchCsrfToken(): Promise<string> {
  const res = await fetch("/api/csrf-token", {
    credentials: "include",
  });
  
  if (!res.ok) {
    // User not authenticated or token endpoint not available
    return "";
  }
  
  const data = await res.json();
  return data.csrfToken || "";
}

// Get CSRF token (cached)
async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }
  
  // Deduplicate concurrent requests
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetchCsrfToken().then(token => {
      csrfToken = token;
      csrfTokenPromise = null;
      return token;
    }).catch(() => {
      csrfTokenPromise = null;
      return "";
    });
  }
  
  return csrfTokenPromise;
}

// Clear CSRF token (call on logout)
export function clearCsrfToken() {
  csrfToken = null;
  csrfTokenPromise = null;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add CSRF token for state-changing requests
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const token = await getCsrfToken();
    if (token) {
      headers["X-CSRF-Token"] = token;
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
