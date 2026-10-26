import { Cache } from './pokecache.js';

export class PokeAPI {
    private static readonly baseURL = 'https://pokeapi.co/api/v2';
    private cache: Cache;
    constructor() {
        this.cache = new Cache(1200);
    }

    async fetchLocations(pageUrl?: string): Promise<ShallowLocations> {
        let url = pageUrl && pageUrl.length > 0? `${pageUrl}` : `${PokeAPI.baseURL}/location/`;
        let result  = this.cache.get<LocationListResponse>(url)
        if(result === undefined)
        {
            const response = await (await fetch(url)).json();
            this.cache.add(url, response);
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
        let url = `${PokeAPI.baseURL}/location/${locationName}`;
        let result  = this.cache.get<LocationDetailResponse>(url)
        if (result === undefined) {
            const respond = await (fetch (url));
            const json: LocationDetailResponse  = await respond.json();
            this.cache.add(url, json);
            result = json;
        }
        return {name: result.areas[0]?.name} as Location;
    }
}

export type ShallowLocations = {
    nextPage: string | null,
    prevPage: string | null,
    locations: Location[]
}

type LocationListResponse = {
    count: number;
    next : string | null;
    previous: string | null;
    results: Array<{name: string, url: string }>;
}

type LocationDetailResponse = {
    areas: Array<{name: string}>;
}

export type Location = {
    name: string
}