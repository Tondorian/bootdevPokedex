import { afterEach, describe, expect, test, vi } from 'vitest';
import { commandCatch } from '../src/command_catch.js';
import type { State } from '../src/state.js';
import { createState, loggedLines } from './helpers.js';

const catch_ = commandCatch as unknown as (
    state: State,
    ...args: string[]
) => Promise<void>;

afterEach(() => {
    vi.restoreAllMocks();
});

describe('commandCatch', () => {
    test('catches the named Pokemon and re-prompts', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const prompt = vi.fn();
        const fetchPokemon = vi.fn().mockResolvedValue({ name: 'pikachu', id: 25, base_experience: 112 });
        // Stub Math.random to always succeed (0.5 < catch probability)
        vi.stubGlobal('Math', { random: () => 0.5 } as typeof Math);

        const state = createState({
            interface: { prompt, close: vi.fn() } as State['interface'],
            pokeApi: { fetchLocations: vi.fn(), fetchLocation: vi.fn(), fetchPokemon } as unknown as State['pokeApi'],
            pokedex: {},
        }).state;

        await catch_(state, 'pikachu');

        expect(fetchPokemon).toHaveBeenCalledWith('pikachu');
        const lines = loggedLines(log);
        expect(lines).toContain('Throwing a Pokeball at pikachu...');
        expect(lines).toContain('pikachu was caught!');
    });

    test('uses only the first argument when multiple are provided', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const prompt = vi.fn();
        const fetchPokemon = vi.fn().mockResolvedValue({ name: 'charizard', id: 6, base_experience: 240 });

        vi.stubGlobal('Math', { random: () => 0.5 } as typeof Math);

        const state = createState({
            interface: { prompt, close: vi.fn() } as State['interface'],
            pokeApi: { fetchLocations: vi.fn(), fetchLocation: vi.fn(), fetchPokemon } as unknown as State['pokeApi'],
            pokedex: {},
        }).state;

        await catch_(state, 'charizard', 'extra');

        expect(fetchPokemon).toHaveBeenCalledWith('charizard');
        const lines = loggedLines(log);
        expect(lines).toContain('Throwing a Pokeball at charizard...');
    });
    test('asks for a Pokemon name when no argument is provided', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const prompt = vi.fn();

        const state = createState({
            interface: { prompt, close: vi.fn() } as State['interface'],
        }).state;

        await catch_(state);

        expect(prompt).toHaveBeenCalledTimes(1);
        const lines = loggedLines(log);
        expect(lines.some((l) => /pokemon/i.test(l))).toBe(true);
    });

    test('reports escape when random roll fails', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const prompt = vi.fn();
        const fetchPokemon = vi.fn().mockResolvedValue({ name: 'pikachu', id: 25, base_experience: 112 });

        // Stub Math.random to always return >= 1 so it always fails the catch check
        vi.stubGlobal('Math', { random: () => 1.0 } as typeof Math);

        const state = createState({
            interface: { prompt, close: vi.fn() } as State['interface'],
            pokeApi: { fetchLocations: vi.fn(), fetchLocation: vi.fn(), fetchPokemon } as unknown as State['pokeApi'],
            pokedex: {},
        }).state;

        await catch_(state, 'pikachu');

        const lines = loggedLines(log);
        expect(lines).toContain('Throwing a Pokeball at pikachu...');
        expect(lines).toContain('pikachu escaped!');
    });

    test('uses base_experience to determine catch probability (higher exp is harder)', async () => {
        // Stub Math.random so 0.4 < catchChance succeeds, but we verify the formula uses base_exp
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const prompt = vi.fn();

        // Weak Pokemon (low base_exp → higher probability)
        const fetchWeak = vi.fn().mockResolvedValue({ name: 'magikarp', id: 129, base_experience: 8 });
        vi.stubGlobal('Math', { random: () => 0.4 } as typeof Math);

        const stateWeak = createState({
            interface: { prompt, close: vi.fn() } as State['interface'],
            pokeApi: { fetchLocations: vi.fn(), fetchLocation: vi.fn(), fetchPokemon: fetchWeak } as unknown as State['pokeApi'],
            pokedex: {},
        }).state;

        await catch_(stateWeak, 'magikarp');
        expect(loggedLines(console.log)).toContain('magikarp was caught!');

        // Strong Pokemon (high base_exp → lower probability)  
        vi.spyOn(console, 'log').mockClear();
        const fetchStrong = vi.fn().mockResolvedValue({ name: 'mewtwo', id: 150, base_experience: 306 });
        vi.stubGlobal('Math', { random: () => 0.4 } as typeof Math);

        const stateStrong = createState({
            interface: { prompt, close: vi.fn() } as State['interface'],
            pokeApi: { fetchLocations: vi.fn(), fetchLocation: vi.fn(), fetchPokemon: fetchStrong } as unknown as State['pokeApi'],
            pokedex: {},
        }).state;

        await catch_(stateStrong, 'mewtwo');
        expect(loggedLines(console.log)).toContain('mewtwo escaped!');
    });

    test('adds caught Pokemon to the pokedex', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const prompt = vi.fn();
        const fetchPokemon = vi.fn().mockResolvedValue({ name: 'pikachu', id: 25, base_experience: 112 });

        vi.stubGlobal('Math', { random: () => 0.5 } as typeof Math);

        const pokedex: Record<string, { name: string; id: number; base_experience: number }> = {};
        const state = createState({
            interface: { prompt, close: vi.fn() } as State['interface'],
            pokeApi: { fetchLocations: vi.fn(), fetchLocation: vi.fn(), fetchPokemon } as unknown as State['pokeApi'],
            pokedex,
        }).state;

        await catch_(state, 'pikachu');

        expect(state.pokedex).toHaveProperty('pikachu');
    });

});