import { DataFormat } from './domain';

export function serialize(object: unknown): string {
    return typeof object === 'string' ? object : JSON.stringify(object, null, 2);
}

export function deserialize<T>(content: string): T {
    return JSON.parse(content);
}

export const JsonFormat: DataFormat<unknown> = {
    serialize,
    deserialize
};
