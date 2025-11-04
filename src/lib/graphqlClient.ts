import { GraphQLClient } from 'graphql-request';

const endpoint = import.meta.env.VITE_API_URL || 'http://localhost:8080/graphql';

export const client = new GraphQLClient(endpoint, {
  headers: () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

export async function gqlRequest(query: string, variables?: Record<string, any>) {
  return client.request(query, variables);
}
