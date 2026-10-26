import { afterEach, describe, expect, test, vi } from 'vitest';
import { commandMap, commandMapB } from '../src/command_map.js';
import { createState, loggedLines } from './helpers.js';

const LIST_URL = 'https://pokeapi.co/api/v2/location-area/';
const SECOND_PAGE_URL = `${LIST_URL}?offset=20&limit=20`;
const THIRD_PAGE_URL = `${LIST_URL}?offset=40&limit=20`;

const firstPage = {
    nextPage: SECOND_PAGE_URL,
    prevPage: null,
    locations: [{ name: 'canalave-city-area' }, { name: 'eterna-city-area' }],
};

const secondPage = {
    nextPage: THIRD_PAGE_URL,
    prevPage: LIST_URL,
    locations: [{ name: 'oreburgh-city-area' }, { name: 'pastoria-city-area' }],
};

afterEach(() => {
    vi.restoreAllMocks();
});

describe('commandMap', () => {
    test('fetches the first page when no page is stored yet', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, fetchLocations } = createState();
        fetchLocations.mockResolvedValue(firstPage);

        await commandMap(state);

        expect(fetchLocations).toHaveBeenCalledTimes(1);
        // boot.dev passes the stored page URL through; a missing page may be
        // null or undefined depending on the REPL state.
        expect(fetchLocations.mock.calls[0][0]).toBeFalsy();
        expect(loggedLines(log)).toEqual([
            'canalave-city-area',
            'eterna-city-area',
        ]);
        expect(state.nextLocationURL).toBe(SECOND_PAGE_URL);
        expect(state.prevLocationURL).toBeNull();
    });

    test('fetches the stored next page and advances the pagination state', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, fetchLocations } = createState({
            nextLocationURL: SECOND_PAGE_URL,
            prevLocationURL: LIST_URL,
        });
        fetchLocations.mockResolvedValue(secondPage);

        await commandMap(state);

        expect(fetchLocations).toHaveBeenCalledWith(SECOND_PAGE_URL);
        expect(loggedLines(log)).toEqual([
            'oreburgh-city-area',
            'pastoria-city-area',
        ]);
        expect(state.nextLocationURL).toBe(THIRD_PAGE_URL);
        expect(state.prevLocationURL).toBe(LIST_URL);
    });
});

describe('commandMapB', () => {
    test("prints a hint and does not fetch on the first page", async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, fetchLocations } = createState();

        await commandMapB(state);

        expect(fetchLocations).not.toHaveBeenCalled();
        expect(loggedLines(log)).toContain("you're on the first page");
    });

    test('fetches the stored previous page and moves the pagination back', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state, fetchLocations } = createState({
            nextLocationURL: THIRD_PAGE_URL,
            prevLocationURL: SECOND_PAGE_URL,
        });
        fetchLocations.mockResolvedValue(firstPage);

        await commandMapB(state);

        expect(fetchLocations).toHaveBeenCalledWith(SECOND_PAGE_URL);
        expect(loggedLines(log)).toEqual([
            'canalave-city-area',
            'eterna-city-area',
        ]);
        expect(state.nextLocationURL).toBe(SECOND_PAGE_URL);
        expect(state.prevLocationURL).toBeNull();
    });
});
