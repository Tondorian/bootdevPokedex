import { State } from "./state";

export async function commandHelp(state: State) {
    console.log("Welcome to the Pokedex!")
        console.log("Usage:")
    for(let command in state.commands)
    {
        console.log(`${command}: ${state.commands[command].description}`);
    }
    state.interface.prompt();
}