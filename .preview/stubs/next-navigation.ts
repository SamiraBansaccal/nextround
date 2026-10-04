export const useRouter = () => ({ push: () => {}, refresh: () => {} });
export const usePathname = () => (window as unknown as { __path: string }).__path ?? "/interview";
export const notFound = () => { throw new Error("not found"); };
