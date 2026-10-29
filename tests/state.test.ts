import { afterEach, describe, expect, test, vi } from 'vitest';
import { dispatch } from '../src/state.js';
import type { State } from '../src/state.js';
import { createState, loggedLines } from './helpers.js';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('dispatch', () => {
    test('cleans the input and forwards the command arguments', async () => {
        const callback = vi.fn(
            async (_state: State, ..._args: string[]) => {},
        );
        const { state } = createState({
            commands: {
                explore: { name: 'explore', description: 'explore', callback },
            },
        });

        await dispatch(state, '  EXPLORE   pastoria-city-area  ');

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(state, 'pastoria-city-area');
    });

    test('prints "Unknown command" and re-prompts for an unknown command', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, prompt } = createState();

        await dispatch(state, 'teleport');

        expect(loggedLines(log)).toEqual(['Unknown command']);
        expect(prompt).toHaveBeenCalledTimes(1);
    });

    test('re-prompts for empty input without printing an error', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, prompt } = createState();

        await dispatch(state, '   ');

        expect(loggedLines(log)).toEqual([]);
        expect(prompt).toHaveBeenCalledTimes(1);
    });

    test('prints the error and re-prompts when a command throws', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const callback = vi.fn(async () => {
            throw new Error('the api is down');
        });
        const { state, prompt } = createState({
            commands: {
                map: { name: 'map', description: 'map', callback },
            },
        });

        await dispatch(state, 'map');

        expect(loggedLines(log)).toEqual(['the api is down']);
        expect(prompt).toHaveBeenCalledTimes(1);
    });

    test('does not prompt twice when the command prompts itself', async () => {
        const { state, prompt } = createState({
            commands: {
                help: {
                    name: 'help',
                    description: 'help',
                    callback: async (s) => {
                        s.interface.prompt();
                    },
                },
            },
        });

        await dispatch(state, 'help');

        expect(prompt).toHaveBeenCalledTimes(1);
    });
});
