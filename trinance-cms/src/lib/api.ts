/**
 * Mock API layer. Simulates network latency so the UI exercises real
 * loading / success / error states. In a production build these functions
 * would be swapped for fetch() calls against the Trinance backend.
 */
export const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export async function mockRequest<T>(data: T, ms = 500, failRate = 0): Promise<T> {
  await delay(ms);
  if (failRate > 0 && Math.random() < failRate) {
    throw new Error("Network request failed. Please try again.");
  }
  return data;
}

export function genId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}
