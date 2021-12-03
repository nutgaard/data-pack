import { GeneratorFlow } from './generator-flow';

type Quote = '"' | "'";

function isQuote(ch: string): ch is Quote {
    return ch === '"' || ch === "'";
}

function readCSVLine(chars: string[], startAt: number, delimiter: string = ','): [number, Array<string>] | null {
    let currentQuote: Quote | undefined = undefined;
    let buffer: Array<string> = [];
    let values: Array<string> = [];
    let i = startAt;

    if (startAt >= chars.length) {
        return null;
    }

    for (; i < chars.length; i++) {
        const ch = chars[i];
        if (isQuote(ch)) {
            if (currentQuote === undefined) {
                currentQuote = ch;
            } else if (ch === currentQuote) {
                currentQuote = undefined;
            } else {
                buffer.push(ch);
            }
        } else if (ch === '\\') {
            buffer.push(chars[++i]);
            continue;
        } else if (ch === delimiter && currentQuote === undefined) {
            values.push(buffer.join(''));
            buffer = [];
        } else if (ch === '\n' && currentQuote === undefined) {
            values.push(buffer.join(''));
            buffer = [];
            break;
        } else {
            buffer.push(ch);
        }
    }
    if (buffer.length > 0) {
        values.push(buffer.join(''));
    }

    return [i + 1, values];
}

export function* parseCSV(content: string, delimiter: string = ','): Generator<Array<string>, void> {
    const chars = content.split('');
    let charPointer = 0;
    while (true) {
        const next = readCSVLine(chars, charPointer, delimiter);
        if (next === null) {
            break;
        }
        const [nextPointer, row] = next;
        charPointer = nextPointer;
        yield row;
    }
}

export function parseCSVToFlow(content: string, delimiter: string = ','): GeneratorFlow<Array<string>> {
    return new GeneratorFlow<Array<string>>(() => parseCSV(content, delimiter));
}

export function parseCSVSync(content: string, delimiter: string = ','): Array<string[]> {
    return parseCSVToFlow(content, delimiter).toArray();
}
