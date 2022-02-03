const useColor: boolean = process.env.CI !== 'true';
const RED: string = useColor ? '\x1b[31m' : '';
const GREEN: string = useColor ? '\x1b[32m' : '';
const CYAN: string = useColor ? '\x1b[36m' : '';
const RESET: string = useColor ? '\x1b[0m' : '';

const red = (msg: string) => `${RED}${msg}${RESET}`;
const green = (msg: string) => `${GREEN}${msg}${RESET}`;
const cyan = (msg: string) => `${CYAN}${msg}${RESET}`;

interface Test {
    name: string;
    only: boolean;
    exec(): void;
}

interface Assertion {
    result: boolean;
    message: string;
}

type Verifier = (value: any) => {
    result: boolean;
    expected: string;
    actual: string;
};

const tests: Test[] = [];
const testsWithErrors: string[] = [];
let __scheduled: ReturnType<typeof setTimeout> | undefined = undefined;
let __assertions: Assertion[] = [];

export function test(name: string, exec: () => void, only: boolean = false) {
    tests.push({ name, exec, only });
    if (__scheduled) {
        clearTimeout(__scheduled);
    }
    __scheduled = setTimeout(runTests, 0);
}

export function onlytest(name: string, exec: () => void) {
    test(name, exec, true);
}

export function assertThat(expected: any | Verifier, actual: any, message: string) {
    const verifier: Verifier =
        typeof expected === 'function'
            ? expected
            : (actualValue: any) => {
                  const actualJson = JSON.stringify(actualValue, null, 2);
                  const expectedJson = JSON.stringify(expected, null, 2);
                  const result = actualJson === expectedJson;
                  return { result, expected: expectedJson, actual: actualJson };
              };

    const verification = verifier(actual);
    if (verification.result) {
        __assertions.push({
            result: true,
            message
        });
    } else {
        __assertions.push({
            result: false,
            message: `${message} Expected: '${verification.expected}', but got: '${verification.actual}'`
        });
    }
}

async function runTests() {
    console.log('');
    const onlyTestsDefined = tests.some((it) => it.only);
    const testsToRun = onlyTestsDefined ? tests.filter((it) => it.only) : tests;
    for (const { name, exec } of testsToRun) {
        try {
            let hasErrors = false;
            __assertions = [];

            await exec();

            console.log(`${cyan('[TEST]')} ${name}`);
            __assertions.forEach((it) => {
                const prefix = it.result ? green(' [OK] ') : red(' [KO] ');
                hasErrors ||= !it.result;
                console.log(`${prefix} ${it.message}`);
            });
            console.log('');
            if (hasErrors) {
                testsWithErrors.push(name);
            }
        } catch (e: unknown) {
            console.log(`${red(' [ERROR] ')} threw an exception`, e);
            testsWithErrors.push(name);
        }
    }
    if (testsWithErrors.length > 0) {
        console.log('');
        console.log(red(` [ERROR] ${testsWithErrors.length} test(s) failed.`));
        console.log('');
        process.exit(1);
    }
    console.log('');
}
