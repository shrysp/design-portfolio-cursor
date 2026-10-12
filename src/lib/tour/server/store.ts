/**
 * Where access codes and their spent seconds live.
 *
 * Upstash Redis over its REST API — plain fetch, no client library — because a
 * budget has to survive between serverless invocations and be shared by all of
 * them. Without the two env vars a development server falls back to memory so
 * the tour runs locally; a production build refuses instead, since a budget
 * that resets on every cold start is not a budget.
 */

type Arg = string | number;

export type Store = {
  cmd: <T = unknown>(...args: Arg[]) => Promise<T>;
};

function upstash(url: string, token: string): Store {
  return {
    async cmd<T>(...args: Arg[]) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
        cache: 'no-store',
      });
      const body = await res.json();
      if (!res.ok || body.error) throw new Error(`Store: ${body.error ?? res.status}`);
      return body.result as T;
    },
  };
}

/** The handful of commands access.ts uses, with Redis's reply shapes. */
function memory(): Store {
  const hashes = new Map<string, Map<string, string>>();
  const counters = new Map<string, { n: number; expires: number }>();
  const hash = (key: string) => {
    let h = hashes.get(key);
    if (!h) hashes.set(key, (h = new Map()));
    return h;
  };

  return {
    async cmd<T>(...args: Arg[]) {
      const [name, key, ...rest] = args.map(String);
      let out: unknown;
      switch (name.toUpperCase()) {
        case 'HGETALL':
          out = [...(hashes.get(key) ?? [])].flat();
          break;
        case 'HSET':
          for (let i = 0; i < rest.length; i += 2) hash(key).set(rest[i], rest[i + 1]);
          out = rest.length / 2;
          break;
        case 'HINCRBY': {
          const next = Number(hash(key).get(rest[0]) ?? 0) + Number(rest[1]);
          hash(key).set(rest[0], String(next));
          out = next;
          break;
        }
        case 'HDEL':
          out = rest.filter((f) => hashes.get(key)?.delete(f)).length;
          break;
        case 'INCR': {
          const c = counters.get(key);
          const live = c && c.expires > Date.now() ? c : { n: 0, expires: Infinity };
          live.n++;
          counters.set(key, live);
          out = live.n;
          break;
        }
        case 'EXPIRE': {
          const c = counters.get(key);
          if (c) c.expires = Date.now() + Number(rest[0]) * 1000;
          out = c ? 1 : 0;
          break;
        }
        default:
          throw new Error(`Memory store has no ${name}`);
      }
      return out as T;
    },
  };
}

// On globalThis so a dev server's hot reloads don't hand out a fresh, empty store.
const g = globalThis as { __tourStore?: Store };

export function getStore(): Store {
  if (g.__tourStore) return g.__tourStore;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (url && token) return (g.__tourStore = upstash(url, token));
  if (process.env.NODE_ENV === 'production') {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not set.');
  }
  return (g.__tourStore = memory());
}

/** HGETALL replies as a flat [field, value, …] list. */
export function toRecord(flat: string[] | null): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; flat && i + 1 < flat.length; i += 2) out[flat[i]] = flat[i + 1];
  return out;
}
