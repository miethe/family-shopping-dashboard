import { afterEach, expect, it, vi } from 'vitest';
import { ApiClient } from '../client';
import { websocketUrl } from '@/lib/websocket/url';

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

it('sends authenticated API requests and filters through the current phone origin', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => [] });
  vi.stubGlobal('fetch', fetchMock);
  localStorage.setItem('auth_token', 'sample-token');
  await new ApiClient('/api/v1').get('/gifting/occurrences', { year: 2026, phase: ['bought', 'given'] });
  const [url, request] = fetchMock.mock.calls[0];
  expect(new URL(url).origin).toBe(window.location.origin);
  expect(new URL(url).pathname).toBe('/api/v1/gifting/occurrences');
  expect(new URL(url).searchParams.getAll('phase')).toEqual(['bought', 'given']);
  expect(request.headers.Authorization).toBe('Bearer sample-token');
});

it('keeps explicitly configured API origins working', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 });
  vi.stubGlobal('fetch', fetchMock);
  await new ApiClient('http://localhost:8030/api/v1').delete('/gifts/1');
  expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8030/api/v1/gifts/1');
});

it.each([
  ['http://192.168.1.20:3030', 'ws://192.168.1.20:3030/ws'],
  ['https://gifts.example.test', 'wss://gifts.example.test/ws'],
])('connects the live board through %s', (origin, expected) => {
  const url = new URL(websocketUrl('/ws', origin, 'sample&token'));
  expect(`${url.origin}${url.pathname}`).toBe(expected);
  expect(url.searchParams.get('token')).toBe('sample&token');
});

it('preserves an explicit WebSocket host and existing query parameters', () => {
  const url = new URL(websocketUrl('ws://localhost:8030/ws?topic=demo', 'http://example.test', 'sample'));
  expect(url.host).toBe('localhost:8030');
  expect(url.searchParams.get('topic')).toBe('demo');
  expect(url.searchParams.get('token')).toBe('sample');
});
