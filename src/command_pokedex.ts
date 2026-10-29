import { State } from "./state";

export async function commandPokedex(state: State) {
    console.log("Your Pokedex:")

    for(const pkmn of  Object.keys(state.pokedex))
    {
        console.log(` - ${pkmn}`);
    }
    state.interface.prompt();
}