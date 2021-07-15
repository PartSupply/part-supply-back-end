export declare type Nullable<T> = T | null;
export type ResponseType<T> = {
    data: Nullable<T>;
    errors?: Record<string, Nullable<string>>;
};
