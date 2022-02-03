export interface DataFormat<T> {
    serialize(object: T): string;
    deserialize(object: string): T;
}
