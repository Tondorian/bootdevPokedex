import { State } from "./state";

export async function commandExplore(state: State, ...args: string[]) {
    if (args.length === 0) {
        console.log("Please provide a location name");
        state.interface.prompt();
        return;
    }

    const location = await state.pokeApi.fetchLocation(args[0]);
    console.log(`Exploring ${location.name}...`);
    console.log("Found Pokemon:");
    for (const encounter of location.pokemon_encounters) {
        console.log(` - ${encounter.pokemon.name}`);
    }
}
