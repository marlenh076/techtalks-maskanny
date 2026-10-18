/** Share only concurrent work. Settled results are never retained. */
export function inFlight<K, T>(
  requests: Map<K, Promise<T>>,
  key: K,
  load: () => Promise<T>,
): Promise<T> {
  const existing = requests.get(key);
  if (existing) return existing;
  const pending = load();
  requests.set(key, pending);
  const clear = () => {
    if (requests.get(key) === pending) requests.delete(key);
  };
  void pending.then(clear, clear);
  return pending;
}
