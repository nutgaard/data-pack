import { DataFormat } from './domain';

function writeAsKVSync(object: unknown, delimiter: string = ' '): string {
    if (typeof object === 'string') return object;
    return Object.entries(object)
        .map(([key, value]) => `${key}='${value.replace(/'/g, "\\'")}'`)
        .join(delimiter);
}
function parseKVSync<T>(content: string, delimiter: string = ' '): T {
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
        } else if (ch === '=' && currentQuote === undefined) {
            buffer = valuebuffer;
        } else if ((ch === delimiter && currentQuote === undefined) || (ch === '\n' && currentQuote === undefined)) {
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

export const KvFormat: DataFormat<unknown> = {
    serialize(object: Array<string[]>, delimiter: string = ' '): string {
        return writeAsKVSync(object, delimiter);
    },
    deserialize(content: string, delimiter: string = ' '): Array<string[]> {
        return parseKVSync(content, delimiter);
    }
};
