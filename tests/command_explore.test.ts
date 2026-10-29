import { afterEach, describe, expect, test, vi } from 'vitest';
import { commandExplore } from '../src/command_explore.js';
import type { State } from '../src/state.js';
import { createState, loggedLines } from './helpers.js';

/**
 * The boot.dev command callbacks receive the command arguments after the
 * state. The current implementation does not declare them yet, so the test
 * calls the exported function through the expected boot.dev signature.
 */
const explore = commandExplore as unknown as (
    state: State,
    ...args: string[]
) => Promise<void>;

afterEach(() => {
    vi.restoreAllMocks();
});

describe('commandExplore', () => {
    test('fetches the named location and lists the Pokemon found there', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const exit = vi
            .spyOn(process, 'exit')
            .mockImplementation(() => undefined as never);
        const { state, close, fetchLocation, prompt } = createState();
        fetchLocation.mockResolvedValue({
            name: 'pastoria-city-area',
            pokemon_encounters: [
                { pokemon: { name: 'tentacool' } },
                { pokemon: { name: 'tentacruel' } },
            ],
        });

        await explore(state, 'pastoria-city-area');

        expect(fetchLocation).toHaveBeenCalledWith('pastoria-city-area');

        const lines = loggedLines(log);
        expect(lines).toContain('Exploring pastoria-city-area...');
        expect(lines).toContain('Found Pokemon:');
        expect(lines).toContain(' - tentacool');
        expect(lines).toContain(' - tentacruel');
        expect(close).not.toHaveBeenCalled();
        expect(exit).not.toHaveBeenCalled();
        expect(prompt).toHaveBeenCalledTimes(1);
    });

    test('asks for a location name when the argument is missing', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const exit = vi
            .spyOn(process, 'exit')
            .mockImplementation(() => undefined as never);
        const { state, close, fetchLocation, prompt } = createState();

        await explore(state);

        expect(fetchLocation).not.toHaveBeenCalled();
        expect(
            loggedLines(log).some((line) => /location/i.test(line)),
        ).toBe(true);
        expect(close).not.toHaveBeenCalled();
        expect(exit).not.toHaveBeenCalled();
        expect(prompt).toHaveBeenCalledTimes(1);
    });
});
