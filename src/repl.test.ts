import { describe, expect, test } from 'vitest';
import { cleanInput } from './repl.js';

/*
 * Each table entry becomes its own test, so a failure points directly at the
 * offending input instead of the whole table.
 */
describe('cleanInput', () => {
    test.concurrent.each([
        {
            input: 'hello world   ',
            expected: ['hello', 'world'],
        },
        {
            input: 'Charmander Bulbasaur PIKACHU',
            expected: ['charmander', 'bulbasaur', 'pikachu'],
        },
        {
            input: '   charizard   ',
            expected: ['charizard'],
        },
        {
            input: 'a   b\tc\nd',
            expected: ['a', 'b', 'c', 'd'],
        },
        {
            input: '',
            expected: [],
        },
        {
            input: '    ',
            expected: [],
        },
    ])('cleanInput($input)', ({ input, expected }) => {
        expect(cleanInput(input)).toEqual(expected);
    });
});
