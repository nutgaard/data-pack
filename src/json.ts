export function serialize(content: any): string {
    return typeof content === 'string' ? content : JSON.stringify(content, null, 2);
}

export function deserialize<T>(content: string): T {
    return JSON.parse(content);
}
