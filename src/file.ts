import * as fs from 'fs';
import { WriteStream } from 'fs';
import * as fsP from 'fs/promises';
import { serialize, deserialize } from './dataformat/json';

export async function read(path: string): Promise<string> {
    return fsP.readFile(path, 'utf8');
}
export function readSync(path: string): string {
    return fs.readFileSync(path, 'utf8');
}
export async function readJSON<T>(path: string): Promise<T> {
    const content = await read(path);
    return deserialize<T>(content);
}
export function readJSONSync<T>(path: string): T {
    return deserialize(fs.readFileSync(path, 'utf8'));
}

export async function write(path: string, content: any): Promise<void> {
    return fsP.writeFile(path, serialize(content), 'utf8');
}
export function writeSync(path: string, content: any): void {
    return fs.writeFileSync(path, serialize(content), 'utf8');
}

export function withWriteStream(path: string, block: (stream: WriteStream) => void): void {
    const writeStream = fs.createWriteStream(path, 'utf8');
    block(writeStream);
    writeStream.close();
}
