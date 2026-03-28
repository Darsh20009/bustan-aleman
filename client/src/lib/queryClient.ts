import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    let message = `${res.status}: ${text}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed.message) message = parsed.message;
    } catch {}
    throw new Error(message);
  }
}

export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions?: string | { method?: string; body?: string; headers?: Record<string, string> } | null,
  data?: unknown,
): Promise<Response> {
  let method: string;
  let url: string;
  let body: unknown;

  if (methodOrUrl.startsWith('/') || methodOrUrl.startsWith('http')) {
    url = methodOrUrl;
    if (typeof urlOrOptions === 'string') {
      method = urlOrOptions || 'GET';
      body = data;
    } else if (urlOrOptions && typeof urlOrOptions === 'object') {
      method = (urlOrOptions as any).method || 'GET';
      const rawBody = (urlOrOptions as any).body;
      body = rawBody ? JSON.parse(rawBody) : undefined;
    } else {
      method = 'GET';
      body = undefined;
    }
  } else {
    method = methodOrUrl;
    url = urlOrOptions as string;
    body = data;
  }

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
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
    const res = await fetch(queryKey[0] as string, {
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
