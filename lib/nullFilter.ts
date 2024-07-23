export const nullFilter = ((v: any) => v != null) as any as <T>(
    x: T | null | undefined,
) => x is NonNullable<T>;
