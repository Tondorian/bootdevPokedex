import { State } from "./state";
import { Pokemon } from "./pokemon";
export async function commandCatch(state: State, ...args: string[]) {
    if (args.length >= 1) {
        console.log(`Throwing a Pokeball at ${args[0]}...`);
        const pokemon = await state.pokeApi.fetchPokemon(args[0])
        const chance = Math.random();
        // Higher base experience makes a Pokemon harder to catch.
        const catchChance = 1 - pokemon.base_experience / 500;
        if (chance < catchChance)
        {
            console.log(`${pokemon.name} was caught!`);
            state.pokedex[pokemon.name] = pokemon;
        }
        else 
        {
            console.log(`${pokemon.name} escaped!`);
        }
    }
    else
    {
        console.log("specify which pokemon to catch")
    }
    state.interface.prompt();
}