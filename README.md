# Data-pack

Utility pack for working with random data

## File utils

Simple wrapper around `fs` and `fs/promises`.

```typescript
function read(path: string): Promise<string>;
function readSync(path: string): string;
function readJSON<T>(path: string): Promise<T>;
function readJSONSync<T>(path: string): Promise<T>;

function write(path: string, content: any): Promise<void>;
function writeSync(path: string, content: any): void;
function withWriteStream(path: string, block: (stream: WriteStream) => void): void;
```

## CSV

Utilities for parsing and writing CSV files

```typescript
function* parseCSV(content: string, delimiter: string = ''): Generator<Array<string>, void>;
function* parseCSVSync(content: string, delimiter: string = ''): Array<Array<string>>;
function* parseCSVToFlow(content: string, delimiter: string = ''): GeneratorFlow<Array<string>>;
```

## JSON

Utilities for parsing and writing JSON

```typescript
function serialize(content: any): string;
function deserialize<T>(content: string): T;
```

## Generator flows

Utilities for working with generators as if they are arrays

```typescript
// Creation
const flow = GeneratorFlow.ofArray([1, 2, 3, 4]);
const numFlow = GeneratorFlow.ofArray([5, 6]);
const otherFlow = new GeneratorFlow(function* () {
    yield 'a';
    yield 'b';
    yield 'c';
    yield 'd';
});

// Stream functions
flow.skipWhile((it) => it < 2); // Flow[3,4]
flow.takeWhile((it) => it < 2); // Flow[1]
flow.skip(2); // Flow[3,4]
flow.tail(); // Flow[2,3,4]
flow.take(2); // Flow[1,2]
flow.map((it) => it * 2); // Flow[2,4,6,8]
flow.flatMap((it) => [it * 2]); // Flow[2,4,6,8]
flow.filter((it) => it % 2 == 0); // Flow[2,4]
flow.zip(otherFlow); // Flow[[1, 'a'], [2, 'b'], [3, 'c'], [4, 'd']]
flow.cartesianProduct(otherFlow); // Flow[[1, 'a'], [1, 'b'], [1, 'c'], [1, 'd'], [2, 'a'], ... [4, 'd']]
flow.concat(otherFlow); // Flow[1, 2, 3, 4, 5, 6]
flow.peek(console.log); // Flow[1, 2, 3, 4]
flow.reduce(add, 0); // 10
flow.size(); // 4
flow.toArray(); // [1, 2, 3, 4]
flow.toSet(); // Set<1, 2, 3, 4>
```
