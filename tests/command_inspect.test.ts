import { afterEach, describe, expect, test, vi } from 'vitest';
import { commandInspect } from '../src/command_inspect.js';
import type { State } from '../src/state.js';
import { createState, loggedLines } from './helpers.js';

/**
 * The boot.dev command callbacks receive the command arguments after the
 * state. The current implementation does not declare them yet, so the test
 * calls the exported function through the expected boot.dev signature.
 */
const inspect = commandInspect as unknown as (
    state: State,
    ...args: string[]
) => Promise<void>;

const pidgey = {
    id: 16,
    name: 'pidgey',
    base_experience: 50,
    height: 3,
    weight: 18,
    stats: [
        { base_stat: 40, stat: { name: 'hp' } },
        { base_stat: 45, stat: { name: 'attack' } },
        { base_stat: 40, stat: { name: 'defense' } },
        { base_stat: 35, stat: { name: 'special-attack' } },
        { base_stat: 35, stat: { name: 'special-defense' } },
        { base_stat: 56, stat: { name: 'speed' } },
    ],
    types: [
        { slot: 1, type: { name: 'normal' } },
        { slot: 2, type: { name: 'flying' } },
    ],
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe('commandInspect', () => {
    test('prints the information of a caught Pokemon and re-prompts', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, prompt } = createState({ pokedex: { pidgey } });

        await inspect(state, 'pidgey');

        expect(loggedLines(log)).toEqual([
            'Name: pidgey',
            'Height: 3',
            'Weight: 18',
            'Stats:',
            '  -hp: 40',
            '  -attack: 45',
            '  -defense: 40',
            '  -special-attack: 35',
            '  -special-defense: 35',
            '  -speed: 56',
            'Types:',
            '  - normal',
            '  - flying',
        ]);
        expect(prompt).toHaveBeenCalledTimes(1);
    });

    test('reports that the Pokemon has not been caught and re-prompts', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, prompt } = createState({ pokedex: {} });

        await inspect(state, 'pidgey');

        const lines = loggedLines(log);
        expect(lines.some((line) => /not caught/i.test(line))).toBe(true);
        expect(prompt).toHaveBeenCalledTimes(1);
    });

    test('reports an error when no Pokemon name is provided', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, prompt } = createState({ pokedex: { pidgey } });

        await inspect(state);

        const lines = loggedLines(log);
        expect(lines.some((line) => /pokemon/i.test(line))).toBe(true);
        expect(prompt).toHaveBeenCalledTimes(1);
    });
});
