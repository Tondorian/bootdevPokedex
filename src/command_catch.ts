import { State } from "./state";

export async function commandCatch(state: State, ...args: string[]) {
    if (args.length >= 1) {
        console.log(`Throwing a Pokeball at ${args[0]}`);
    }
    else
    {
        console.log("specify witch pokemon to catch")
        console.log("usage: ")
        console.log("catch <pokemon>")
    }
}