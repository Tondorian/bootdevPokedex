import { vi } from 'vitest';
import type { Interface } from 'node:readline';
import type { PokeAPI } from '../src/pokeapi.js';
import type { CLICommand, State } from '../src/state.js';

/**
 * Builds the command registry used by the help command tests.
 */
function createCommands(): Record<string, CLICommand> {
    const noop = async () => {};

    return {
        help: {
            name: 'help',
            description: 'Displays a help message',
            callback: noop,
        },
        exit: {
            name: 'exit',
            description: 'Exits the pokedex',
            callback: noop,
        },
    };
}

/**
 * Creates a State whose I/O and PokeAPI dependencies are replaceable mocks.
 * The returned mocks can be used to configure responses and assert calls.
 */
export function createState(overrides: Partial<State> = {}) {
    const prompt = vi.fn();
    const close = vi.fn();
    const fetchLocations = vi.fn();
    const fetchLocation = vi.fn();

    const state: State = {
        interface: { prompt, close } as unknown as Interface,
        commands: createCommands(),
        pokeApi: { fetchLocations, fetchLocation } as unknown as PokeAPI,
        nextLocationURL: null,
        prevLocationURL: null,
        ...overrides,
    };

    return { state, prompt, close, fetchLocations, fetchLocation };
}

/**
 * Flattens every console.log call into one line per call.
 */
export function loggedLines(spy: { mock: { calls: unknown[][] } }): string[] {
    return spy.mock.calls.map((call) => call.map(String).join(' '));
}
