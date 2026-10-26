import { afterEach, describe, expect, test, vi } from 'vitest';
import { PokeAPI } from './pokeapi.js';

const BASE_URL = 'https://pokeapi.co/api/v2';
const LIST_URL = `${BASE_URL}/location/`;
const SECOND_PAGE_URL = `${BASE_URL}/location/?offset=20&limit=20`;

const firstPage = {
    count: 2,
    next: SECOND_PAGE_URL,
    previous: null,
    results: [
        { name: 'canalave-city', url: `${BASE_URL}/location/1/` },
        { name: 'eterna-city', url: `${BASE_URL}/location/2/` },
    ],
};

const secondPage = {
    count: 2,
    next: null,
    previous: LIST_URL,
    results: [{ name: 'oreburgh-city', url: `${BASE_URL}/location/3/` }],
};

/** Minimal stand-in for the parts of Response that PokeAPI consumes. */
function jsonResponse(data: unknown) {
    return { ok: true, status: 200, json: async () => data };
}

/** Replaces the global fetch with a stub that records every requested URL. */
function stubFetch(handler: (url: string) => unknown) {
    const fetchMock = vi.fn(async (url: string) => jsonResponse(handler(url)));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

function requestedUrls(fetchMock: ReturnType<typeof stubFetch>): string[] {
    return fetchMock.mock.calls.map(([url]) => url);
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

describe('PokeAPI.fetchLocations', () => {
    test('requests the location list once and maps the response', async () => {
        const fetchMock = stubFetch((url) =>
            url === LIST_URL
                ? firstPage
                : { areas: [{ name: `${url.split('/').at(-2)}-area` }] },
        );
        const api = new PokeAPI();

        const page = await api.fetchLocations();

        expect(requestedUrls(fetchMock)).toEqual([LIST_URL]);
        expect(page.nextPage).toBe(firstPage.next);
        expect(page.prevPage).toBe(firstPage.previous);
        expect(page.locations.map((location) => location.name)).toEqual([
            'canalave-city',
            'eterna-city',
        ]);
    });

    test('serves a repeated call from the cache', async () => {
        const fetchMock = stubFetch(() => firstPage);
        const api = new PokeAPI();

        await api.fetchLocations();
        await api.fetchLocations();

        expect(requestedUrls(fetchMock)).toEqual([LIST_URL]);
    });

    test('uses the requested page URL as the cache key', async () => {
        const fetchMock = stubFetch((url) =>
            url === SECOND_PAGE_URL ? secondPage : firstPage,
        );
        const api = new PokeAPI();

        await api.fetchLocations();
        await api.fetchLocations(SECOND_PAGE_URL);
        await api.fetchLocations();
        await api.fetchLocations(SECOND_PAGE_URL);

        expect(requestedUrls(fetchMock)).toEqual([LIST_URL, SECOND_PAGE_URL]);
    });

    test('does not request every location individually', async () => {
        const fetchMock = stubFetch((url) =>
            url === LIST_URL ? firstPage : { areas: [{ name: 'irrelevant-area' }] },
        );
        const api = new PokeAPI();

        await api.fetchLocations();

        expect(requestedUrls(fetchMock)).toEqual([LIST_URL]);
    });

    test('refetches once the cache entry has expired', async () => {
        vi.useFakeTimers();
        const fetchMock = stubFetch(() => firstPage);
        const api = new PokeAPI(); // cache interval is 1200 ms

        await api.fetchLocations();
        vi.advanceTimersByTime(5000);
        await api.fetchLocations();

        expect(requestedUrls(fetchMock)).toEqual([LIST_URL, LIST_URL]);
    });
});

describe('PokeAPI.fetchLocation', () => {
    test('returns the first area of the location', async () => {
        stubFetch(() => ({ areas: [{ name: 'canalave-city-area' }, { name: 'other-area' }] }));
        const api = new PokeAPI();

        const location = await api.fetchLocation('canalave-city');

        expect(location.name).toBe('canalave-city-area');
    });

    test('serves a repeated call from the cache', async () => {
        const fetchMock = stubFetch(() => ({ areas: [{ name: 'canalave-city-area' }] }));
        const api = new PokeAPI();

        await api.fetchLocation('canalave-city');
        await api.fetchLocation('canalave-city');

        expect(requestedUrls(fetchMock)).toEqual([`${BASE_URL}/location/canalave-city`]);
    });
});
