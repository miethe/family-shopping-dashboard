/** Resolve a gateway path or an explicitly configured WebSocket endpoint. */
export function websocketUrl(endpoint: string, origin: string, token: string): string {
  const url = new URL(endpoint, origin);
  if (url.protocol === 'http:') url.protocol = 'ws:';
  if (url.protocol === 'https:') url.protocol = 'wss:';
  url.searchParams.set('token', token);
  return url.toString();
}
