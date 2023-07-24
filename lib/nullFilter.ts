export const nullFilter = ((v: any) => v != null) as any as <T>(
    x: T | false | null | undefined,
) => x is NonNullable<T>;
