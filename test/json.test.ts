import { test, assertThat } from './test-lib';
import { serialize, deserialize } from '../src/json';

test('should not try to serialize string', () => {
    assertThat('hei', serialize('hei'), 'string is the same');
});

test('should serialize objects and arrays', () => {
    assertThat('[\n  "content"\n]', serialize(['content']), 'array is serialized');
    assertThat('{\n  "content": "hei"\n}', serialize({ content: 'hei' }), 'object is serialized');
});

test('should deserialize json', () => {
    assertThat(['content'], deserialize('[\n  "content"\n]'), 'array is deserialized');
    assertThat({ content: 'hei' }, deserialize('{\n  "content": "hei"\n}'), 'object is deserialized');
});
