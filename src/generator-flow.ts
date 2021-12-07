export class GeneratorFlow<T = unknown> {
    private readonly generator: () => Generator<T, void, undefined>;

    constructor(generator: () => Generator<T, void, undefined>) {
        this.generator = generator;
    }

    static ofArray<T>(array: T[]): GeneratorFlow<T> {
        return new GeneratorFlow(function* () {
            for (const val of array) {
                yield val;
            }
        });
    }

    skipWhile(predicate: (t: T, index: number) => boolean): GeneratorFlow<T> {
        const thisGenerator = this.generator();
        return new GeneratorFlow(function* () {
            let index = 0;
            let skipping = true;
            for (const val of thisGenerator) {
                if (!skipping) {
                    yield val;
                } else if (!predicate(val, index++)) {
                    skipping = false;
                    yield val;
                }
            }
        });
    }

    takeWhile(predicate: (t: T, index: number) => boolean): GeneratorFlow<T> {
        const thisGenerator = this.generator();
        return new GeneratorFlow(function* () {
            let index = 0;
            for (const val of thisGenerator) {
                if (predicate(val, index++)) {
                    yield val;
                } else {
                    break;
                }
            }
        });
    }

    skip(num: number): GeneratorFlow<T> {
        return this.skipWhile((_, index) => index < num);
    }

    tail(): GeneratorFlow<T> {
        return this.skip(1);
    }

    take(num: number): GeneratorFlow<T> {
        return this.takeWhile((_, index) => index < num);
    }

    map<S>(func: (t: T, index: number) => S): GeneratorFlow<S> {
        const thisGenerator = this.generator();
        return new GeneratorFlow(function* () {
            let index = 0;
            for (const val of thisGenerator) {
                yield func(val, index++);
            }
        });
    }

    flatMap<S>(func: (t: T, index: number) => Generator<S, void, undefined>): GeneratorFlow<S> {
        const thisGenerator = this.generator();
        return new GeneratorFlow(function* () {
            let index = 0;
            for (const val of thisGenerator) {
                yield* func(val, index++);
            }
        });
    }

    filter(predicate: (t: T) => boolean): GeneratorFlow<T> {
        const thisGenerator = this.generator();
        return new GeneratorFlow(function* () {
            let index = 0;
            for (const val of thisGenerator) {
                if (predicate(val)) {
                    yield val;
                }
            }
        });
    }

    reduce<S>(func: (accumulator: S, element: T, index: number) => S, initialValue: S): S {
        let accumulator: S = initialValue;
        let index = 0;
        for (const val of this.generator()) {
            accumulator = func(accumulator, val, index++);
        }
        return accumulator;
    }

    zip<S>(other: Generator<S> | GeneratorFlow<S>): GeneratorFlow<[T, S]> {
        const thisGenerator = this.generator();
        const otherGenerator: Generator<S> = other instanceof GeneratorFlow ? other.generator() : other;
        return new GeneratorFlow(function* () {
            while (true) {
                const thisNext: IteratorResult<T, void> = thisGenerator.next();
                const otherNext: IteratorResult<S, void> = otherGenerator.next();
                if (thisNext.done || otherNext.done) {
                    break;
                }
                if (thisNext.value && otherNext.value) {
                    yield [thisNext.value, otherNext.value];
                }
            }
        });
    }

    cartesianProduct<S>(other: () => Generator<S> | GeneratorFlow<S>): GeneratorFlow<[T, S]> {
        const thisGenerator = this.generator();
        return new GeneratorFlow(function* () {
            for (const thisVal of thisGenerator) {
                const otherInstance = other();
                const otherGenerator: Generator<S> =
                    otherInstance instanceof GeneratorFlow ? otherInstance.generator() : otherInstance;
                for (const otherVal of otherGenerator) {
                    yield [thisVal, otherVal];
                }
            }
        });
    }

    concat(other: Generator<T> | GeneratorFlow<T>): GeneratorFlow<T> {
        const thisGenerator = this.generator();
        const otherGenerator: Generator<T> = other instanceof GeneratorFlow ? other.generator() : other;
        return new GeneratorFlow(function* () {
            yield* thisGenerator;
            yield* otherGenerator;
        });
    }

    size() {
        let count = 0;
        for (const val of this.generator()) {
            count++;
        }
        return count;
    }

    peek(block: (t: T) => void) {
        const thisGenerator = this.generator();
        return new GeneratorFlow(function* () {
            for (const val of thisGenerator) {
                block(val);
                yield val;
            }
        });
    }

    toArray(): T[] {
        const array: T[] = [];
        for (const val of this.generator()) {
            array.push(val);
        }
        return array;
    }

    toSet(): Set<T> {
        return new Set(this.toArray());
    }
}
