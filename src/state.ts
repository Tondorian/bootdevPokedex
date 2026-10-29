import { createInterface, Interface } from "readline"
import { commandExit } from './command_exit';
import { commandHelp } from './command_help';
import { commandExplore } from './command_explore'
import { commandMap, commandMapB } from "./command_map";
import { PokeAPI } from "./pokeapi";
import { cleanInput } from "./repl";
import { commandCatch } from "./command_catch";
import { Pokemon } from "./pokemon";
import { commandInspect } from "./command_inspect";
import { commandPokedex } from "./command_pokedex";

export type CLICommand = {
    name: string,
    description: string,
    callback: (state: State, ...args: string[]) => Promise<void> 
} 

export type State = {
    interface: Interface,
    commands: Record<string, CLICommand>,
    pokeApi: PokeAPI,
    pokedex: Record<string, Pokemon>,
    nextLocationURL: string | null,
    prevLocationURL: string | null
}

export async function initState(): Promise<State> {
    const rl = createInterface({input: process.stdin, output: process.stdout, prompt: "Pokedex > "})
    const pokeApi = new PokeAPI;
    const pokedex: Record<string, Pokemon> = {};
    const state: State = {interface: rl, commands: getCommands(), pokeApi, pokedex, prevLocationURL: null, nextLocationURL: null};

    rl.on("line", (line) => {
        void dispatch(state, line);
    });

    return state;
}

/**
 * Parses one REPL input line and runs the matching command.
 * Only failures and unknown commands re-prompt; successful commands do it themselves.
 */
export async function dispatch(state: State, line: string) {
    const [name, ...args] = cleanInput(line);
    if (!name) {
        state.interface.prompt();
        return;
    }

    const command = state.commands[name];
    if (!command) {
        console.log("Unknown command");
        state.interface.prompt();
        return;
    }

    try {
        await command.callback(state, ...args);
    } catch (error) {
        console.log((error as Error).message);
        state.interface.prompt();
    }
}

function getCommands() : Record<string, CLICommand> {
    return {
        exit: {
            name: "exit",
            description: "Exits the pokedex",
            callback: commandExit
        },
        help: {
            name:"help",
            description: "Displays a help message",
            callback: commandHelp
        },
        map: {
            name: "map",
            description: "Show 20 locations to search for pokemon",
            callback: commandMap
        },
        mapb: {
            name: "mapb",
            description: "Show 20 previous locations to search for pokemon",
            callback: commandMapB
        },
        explore: {
            name: "explore",
            description: "explore a map to find some pokemon",
            callback: commandExplore
        },
        catch: {
            name: "catch",
            description: "Try to catch a pokemon",
            callback: commandCatch
        },
        inspect: {

            name: "inspect",
            description: "Inspect a catched pokemon",
            callback: commandInspect
        },
        pokedex: {
            name: "pokedex",
            description: "Show the current pokedex",
            callback: commandPokedex
        }
    }
}