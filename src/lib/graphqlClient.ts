import { GraphQLClient } from 'graphql-request';

// Resolve endpoint in this order:
// 1. runtime-injected window.__env.VITE_API_URL (recommended for static hosts)
// 2. build-time VITE_API_URL (import.meta.env)
// 3. relative '/graphql' (calls same origin)
// 4. fallback to localhost for local dev
function resolveEndpoint(): string {
  try {
    // runtime override (injected by hosting or a small env.js script)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win: any = typeof window !== 'undefined' ? window : undefined;
    if (win && win.__env && win.__env.VITE_API_URL) return win.__env.VITE_API_URL;
  } catch (e) {
    // ignore
  }

  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL as string;

  // If app is served from same origin as backend, prefer relative path
  if (typeof window !== 'undefined' && window.location) return `${window.location.origin}/graphql`;

  return 'http://localhost:8080/graphql';
}

const endpoint = resolveEndpoint();

function createClient() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return new GraphQLClient(endpoint, { headers });
}

export async function gqlRequest(query: string, variables?: Record<string, any>) {
  const client = createClient();
  return client.request(query, variables);
}
