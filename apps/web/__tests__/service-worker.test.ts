// @vitest-environment node
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { expect, it, vi } from 'vitest';

function worker() {
  const handlers: Record<string, (event: any) => void> = {};
  const cache = { addAll: vi.fn(), put: vi.fn() };
  const caches = { open: vi.fn().mockResolvedValue(cache), keys: vi.fn().mockResolvedValue(['family-gifting-v1']), delete: vi.fn().mockResolvedValue(true) };
  vm.runInNewContext(readFileSync('public/sw.js', 'utf8'), {
    self: { location: { origin: 'http://gifts.example.test' }, addEventListener: (name: string, handler: (event: any) => void) => { handlers[name] = handler; }, clients: { claim: vi.fn() }, skipWaiting: vi.fn() },
    URL, Response, caches,
    fetch: vi.fn().mockResolvedValue(new Response('{}')),
  });
  return { handlers, caches, cache };
}

it.each(['/api/v1/gifting/occurrences', '/api/v1/auth/me', '/uploads/sample.png', '/dashboard', '/events/1', 'https://other.example.test/api/v1/gifts'])('never caches or replays private requests: %s', (path) => {
  const { handlers } = worker();
  const respondWith = vi.fn();
  handlers.fetch({ request: { method: 'GET', url: new URL(path, 'http://gifts.example.test').href }, respondWith });
  expect(respondWith).not.toHaveBeenCalled();
});

it('deletes the old cache containing signed-in data when activated', async () => {
  const { handlers, caches } = worker();
  let done: Promise<unknown> | undefined;
  handlers.activate({ waitUntil: (promise: Promise<unknown>) => { done = promise; } });
  await done;
  expect(caches.delete).toHaveBeenCalledWith('family-gifting-v1');
});

it('pre-caches public icons and the manifest without signed-in pages', async () => {
  const { handlers, cache } = worker();
  let done: Promise<unknown> | undefined;
  handlers.install({ waitUntil: (promise: Promise<unknown>) => { done = promise; } });
  await done;
  expect(Array.from(cache.addAll.mock.calls[0][0])).toEqual(['/manifest.json', '/icons/icon-180.png', '/icons/icon-192.png', '/icons/icon-512.png']);
});
