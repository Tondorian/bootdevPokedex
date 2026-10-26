import { afterEach, describe, expect, test, vi } from 'vitest';
import { commandExit } from '../src/command_exit.js';
import { createState, loggedLines } from './helpers.js';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('commandExit', () => {
    test('says goodbye, closes the interface and exits with code 0', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const exit = vi
            .spyOn(process, 'exit')
            .mockImplementation(() => undefined as never);
        const { state, close } = createState();

        await commandExit(state);

        expect(loggedLines(log)).toContain('Closing the Pokedex... Goodbye!');
        expect(close).toHaveBeenCalledTimes(1);
        expect(exit).toHaveBeenCalledWith(0);
    });
});
