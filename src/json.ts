export function serialize(content: any) {
    return typeof content === 'string' ? content : JSON.stringify(content, null, 2);
}

export function deserialize(content: string) {
    try {
        return JSON.parse(content);
    } catch (e: unknown) {
        return content;
    }
}
