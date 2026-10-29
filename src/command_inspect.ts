import { State } from "./state";

export async function commandInspect(state: State, ...args: string[]) {
    if (args.length === 0) {
        console.log("Please provide a pokemon name");
        state.interface.prompt();
        return;
    }
    const pkmn = state.pokedex[args[0]]
    
    if(pkmn === undefined)
    {
        console.log(`not caught`);
    }
    else 
    {
        console.log(`Name: ${pkmn.name}`);
        console.log(`Height: ${pkmn.height}`);
        console.log(`Weight: ${pkmn.weight}`);
        console.log("Stats:")
        for(const stat of pkmn.stats)
        {
            console.log(`  -${stat.stat.name}: ${stat.base_stat}`);
        }
        console.log("Types:");
        for(const type of pkmn.types)
        {
            console.log(`  - ${type.type.name}`);
        }
    }
    state.interface.prompt();
}
