import { State } from "./state";

export async function commandMap(state: State) {
        const locations = await state.pokeApi.fetchLocations(state.nextLocationURL ?? undefined);
        state.nextLocationURL = locations.nextPage;
        state.prevLocationURL = locations.prevPage;
        for (const location of locations.locations) {
            console.log(location.name)
        }
        state.interface.prompt();
}

export async function commandMapB(state: State) {
    if (state.prevLocationURL) {
        const locations = await state.pokeApi.fetchLocations(state.prevLocationURL);
        state.nextLocationURL = locations.nextPage;
        state.prevLocationURL = locations.prevPage;
        for (const location of locations.locations) {
            console.log(location.name)
        }

    }
    else {
        console.log("you're on the first page")
    }
    state.interface.prompt();
}