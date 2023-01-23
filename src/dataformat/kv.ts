import { DataFormat } from './domain';
import { type } from 'os';

interface KvDelimiters {
    keyValueDelimiter: string;
    keyDelimiter: string;
}

export const defaultKvDelimiters: KvDelimiters = {
    keyValueDelimiter: '=',
    keyDelimiter: ' '
};

export function writeKVSync(object: object, delimiters: KvDelimiters = defaultKvDelimiters): string {
    if (typeof object === 'string') return object;
    return Object.entries(object)
        .map(([key, value]) => {
            const valueString = typeof value === 'string' ? value.replace(/'/g, "\\'") : value.toString();
            return `${key}${delimiters.keyValueDelimiter}'${valueString}'`;
        })
        .join(delimiters.keyDelimiter);
}
export function parseKVSync<T>(content: string, delimiters: KvDelimiters = defaultKvDelimiters): T {
    const chars = content.split('');
    const accumulator: { [key: string]: string } = {};
    let keybuffer: string[] = [];
    let valuebuffer: string[] = [];
    let buffer = keybuffer;
    let currentQuote: string | undefined = undefined;

    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (ch === '"' || ch === "'") {
            if (currentQuote === undefined) {
                currentQuote = ch;
            } else if (ch === currentQuote) {
                currentQuote = undefined;
            } else {
                buffer.push(ch);
            }
        } else if (ch === '\\') {
            buffer.push(chars[++i]);
        } else if (ch === delimiters.keyValueDelimiter && currentQuote === undefined) {
            buffer = valuebuffer;
        } else if (
            (ch === delimiters.keyDelimiter && currentQuote === undefined) ||
            (ch === '\n' && currentQuote === undefined)
        ) {
            if (keybuffer.length > 0) {
                accumulator[keybuffer.join('')] = valuebuffer.join('');
            }
            keybuffer = [];
            valuebuffer = [];
            buffer = keybuffer;
        } else {
            buffer.push(ch);
        }
    }
    if (buffer.length > 0) {
        if (keybuffer.length > 0) {
            accumulator[keybuffer.join('')] = valuebuffer.join('');
        }
    }

    return accumulator as unknown as T;
}

type KvFormat<T> = DataFormat<T>;
export const KvFormat: KvFormat<any> = {
    serialize(object: object, delimiters: KvDelimiters = defaultKvDelimiters): string {
        return writeKVSync(object, delimiters);
    },
    deserialize<T>(content: string, delimiters: KvDelimiters = defaultKvDelimiters): T {
        return parseKVSync(content, delimiters);
    }
};
