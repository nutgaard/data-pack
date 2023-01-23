import { test, assertThat } from '../test-lib';
import { KvFormat, writeKVSync } from '../../src/dataformat/kv';

const content = `
action='CREATE' subject='A123456' resource='resource.name' RESOURCE_ID='1234' META='NAME'
action=DELETE subject=A123456 resource=resource.name RESOURCE_ID=6547 META="NAME ADR, OK"
action='READ' subject='A123456' resource='resource.name' RESOURCE_ID='7895' META='NESTEST=value'
`
    .trim()
    .split('\n');

test('should be able to parse keyvalue string', () => {
    const result = content.map((it) => KvFormat.deserialize(it));
    assertThat(
        { action: 'CREATE', subject: 'A123456', resource: 'resource.name', RESOURCE_ID: '1234', META: 'NAME' },
        result[0],
        'audit log should match'
    );
    assertThat(
        { action: 'DELETE', subject: 'A123456', resource: 'resource.name', RESOURCE_ID: '6547', META: 'NAME ADR, OK' },
        result[1],
        'kvlog without quotes should word'
    );
    assertThat(
        { action: 'READ', subject: 'A123456', resource: 'resource.name', RESOURCE_ID: '7895', META: 'NESTEST=value' },
        result[2],
        'nested kv-values should work'
    );
});

test('should serialize with correct delimiters', () => {
    const result = KvFormat.serialize({ action: 'CREATE', subject: 'A123456', RESOURCE_ID: 4 });
    assertThat("action='CREATE' subject='A123456' RESOURCE_ID='4'", result, 'Serialized with default delimiters');

    const result2 = writeKVSync(
        { action: 'CREATE', subject: 'A123456', RESOURCE_ID: 4 },
        { keyValueDelimiter: '#', keyDelimiter: '/' }
    );
    assertThat("action#'CREATE'/subject#'A123456'/RESOURCE_ID#'4'", result2, 'Serialized with default delimiters');
});
