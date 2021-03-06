import * as fs from 'fs';
import { test, assertThat } from '../test-lib';
import { parseCSVSync, CsvFormat } from '../../src/dataformat/csv';

test('should be able to parse super simple csv', () => {
    const csv = parseCSVSync('h1,h2\nv1,v2\nv3,v4');
    assertThat(
        [
            ['h1', 'h2'],
            ['v1', 'v2'],
            ['v3', 'v4']
        ],
        csv,
        'csv content should match'
    );
});

test('should be able to parse simple csv from file', () => {
    const content = fs.readFileSync('test/data/simple.csv', 'utf8');
    assertThat(
        [
            ['column1', 'column2'],
            ['1', '2'],
            ['a', 'b'],
            ['1 2 3 ', ' 2'],
            ["with s'pac'es h\"ere", ' and no sp"aces here']
        ],
        parseCSVSync(content),
        'csv content should match'
    );
});

test('should be able to parse csv with multilne content', () => {
    const content = fs.readFileSync('test/data/multiline.csv', 'utf8');
    assertThat(
        [
            ['column1', 'column2'],
            ['time1', 'this is\nsome content\nover multiple lines'],
            ['time2', 'more\ncontent\nover more\nlines']
        ],
        parseCSVSync(content),
        'csv content should match'
    );
});

test('should implement csv dataformat', () => {
    const data = [
        ['Header 1', 'Header "2"'],
        ['value 1', 'value "2"'],
        ['value 2', "value '2'"],
        ['value 3', 'value \n"2\n and more']
    ];

    const textual: string = CsvFormat.serialize(data);
    const recreated = CsvFormat.deserialize(textual);

    assertThat(data, recreated, 'recreated json is similar to original data');
});
