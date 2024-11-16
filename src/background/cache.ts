export function createCache(limit: number) {
  const data = new Map<string, string>();
  const keys: string[] = [];
  return {
    set(key: string, value: string) {
      if (data.has(key)) {
        return;
      }
      data.set(key, value);
      keys.push(key);
      if (keys.length > limit) {
        const key = keys.shift();
        data.delete(key!);
      }
    },
    get(key: string) {
      return data.get(key);
    },
  };
}
