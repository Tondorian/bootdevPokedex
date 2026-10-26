import { Cache } from './pokecache.js';

const DEFAULT_PAGE_LIMIT = 20;

/**
 * Builds a canonical cache key for a paginated location URL.
 * Equivalent URLs (missing offset/limit, different parameter order, or a
 * missing trailing slash) map to the same key.
 */
function locationPageCacheKey(rawUrl: string): string {
    const url = new URL(rawUrl);

    url.searchParams.set('offset', url.searchParams.get('offset') || '0');
    url.searchParams.set('limit', url.searchParams.get('limit') || String(DEFAULT_PAGE_LIMIT));

    if (!url.pathname.endsWith('/')) {
        url.pathname += '/';
    }

    url.searchParams.sort();
    return url.toString();
}

export class PokeAPI {
    private static readonly baseURL = 'https://pokeapi.co/api/v2';
    private cache: Cache;
    constructor() {
        this.cache = new Cache(5000);
    }

    async fetchLocations(pageUrl?: string): Promise<ShallowLocations> {
        const url = pageUrl && pageUrl.length > 0 ? `${pageUrl}` : `${PokeAPI.baseURL}/location-area/`;
        const cacheKey = locationPageCacheKey(url);
        let result = this.cache.get<LocationListResponse>(cacheKey);
        if (result === undefined)
        {
            const response = await (await fetch(url)).json();
            this.cache.add(cacheKey, response);
            result = response;
        }

        if (result === undefined)
        {
            throw new Error(`Failed to fetch locations from ${url}`);
        }
        return {
            nextPage: result.next,
            prevPage: result.previous,
            locations: result.results.map((location) => ({
                name: location.name
            }))
        };
    }

    async fetchLocation(locationName: string): Promise<Location> {
        const url = `${PokeAPI.baseURL}/location-area/${locationName}`;
        let result = this.cache.get<LocationDetailResponse>(url);
        if (result === undefined) {
            const response = await fetch(url);
            const json: LocationDetailResponse = await response.json();
            this.cache.add(url, json);
            result = json;
        }
        return {
            name: result.name,
            pokemon_encounters: result.pokemon_encounters ?? [],
        };
    }
}

export type ShallowLocations = {
    nextPage: string | null,
    prevPage: string | null,
    locations: Array<{ name: string }>
}

type LocationListResponse = {
    count: number;
    next : string | null;
    previous: string | null;
    results: Array<{name: string, url: string }>;
}

type LocationDetailResponse = {
    name: string;
    pokemon_encounters: PokemonEncounter[];
}

export type Location = {
    name: string,
    pokemon_encounters: PokemonEncounter[]
}

export type PokemonEncounter = {
    pokemon: Pokemon
}

export type Pokemon = {
    name: string,
    url: string
}