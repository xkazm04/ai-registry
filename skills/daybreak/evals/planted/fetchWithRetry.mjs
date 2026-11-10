// Planted: retries every failure forever at a fixed delay, including permanent errors.
export async function fetchWithRetry(url) {
  while (true) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      return await res.json();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
