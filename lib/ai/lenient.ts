import { z } from "zod";

/**
 * Weak models break arrays one item at a time: keep the valid items (up to `max`) instead of failing the
 * whole answer. The value must still be an array, so a wrong shape is still caught (and retried).
 */
export function lenientArray<T extends z.ZodType>(item: T, max: number) {
  return z.array(z.unknown()).transform((items) =>
    items
      .flatMap((x) => {
        const parsed = item.safeParse(x);
        return parsed.success ? [parsed.data as z.output<T>] : [];
      })
      .slice(0, max),
  );
}
