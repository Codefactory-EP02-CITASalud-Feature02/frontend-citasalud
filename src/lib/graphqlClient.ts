import { GraphQLClient } from 'graphql-request';

const endpoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql';

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
