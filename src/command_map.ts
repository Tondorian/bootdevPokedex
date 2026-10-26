import { State } from "./state.js";

export async function commandMap(state: State)
{
    const locations = await state.pokeApi.fetchLocations(state.nextLocationURL);
    state.nextLocationURL = locations.nextPage;
    state.prevLocationURL = locations.prevPage;
    console.log(locations.locations);
    state.interface.prompt();
}

export async function commandMapB(state: State) {
    const locations = await state.pokeApi.fetchLocations(state.prevLocationURL);
    state.nextLocationURL = locations.nextPage;
    state.prevLocationURL = locations.prevPage;
    console.log(locations.locations);
    state.interface.prompt();
}