import { afterEach, describe, expect, test, vi } from 'vitest';
import { commandPokedex } from '../src/command_pokedex.js';
import type { Pokemon } from '../src/pokemon.js';
import { createState, loggedLines } from './helpers.js';

/**
 * Builds a minimal Pokemon fixture; the pokedex command only reads the name.
 */
function pokemon(name: string, id: number): Pokemon {
    return {
        id,
        name,
        base_experience: 0,
        height: 1,
        weight: 1,
        stats: [],
        types: [],
    };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('commandPokedex', () => {
    test('lists the caught Pokemon in pokedex order and re-prompts', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, prompt } = createState({
            pokedex: {
                pidgey: pokemon('pidgey', 16),
                caterpie: pokemon('caterpie', 10),
            },
        });

        await commandPokedex(state);

        expect(loggedLines(log)).toEqual([
            'Your Pokedex:',
            ' - pidgey',
            ' - caterpie',
        ]);
        expect(prompt).toHaveBeenCalledTimes(1);
    });

    test('prints only the header when no Pokemon has been caught', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, prompt } = createState({ pokedex: {} });

        await commandPokedex(state);

        expect(loggedLines(log)).toEqual(['Your Pokedex:']);
        expect(prompt).toHaveBeenCalledTimes(1);
    });
});
