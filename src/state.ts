import { createInterface, Interface } from "readline"
import { commandExit } from './command_exit';
import { commandHelp } from './command_help';
import { commandExplore } from './command_explore'
import { commandMap, commandMapB } from "./command_map";
import { PokeAPI } from "./pokeapi";
import { cleanInput } from "./repl";

export type CLICommand = {
    name: string,
    description: string,
    callback: (state: State, ...args: string[]) => Promise<void> 
} 

export type State = {
    interface: Interface,
    commands: Record<string, CLICommand>,
    pokeApi: PokeAPI,
    nextLocationURL: string | null,
    prevLocationURL: string | null
}

export async function initState() {
    const rl = createInterface({input: process.stdin, output: process.stdout, prompt: "Pokedex > "})
    const pokeApi = new PokeAPI;
    const state: State = {interface: rl, commands: getCommands(), pokeApi, prevLocationURL: null, nextLocationURL: null};
    
    rl.on("line", async (line) => {
        const commands = state.commands;
        const [command, ...args] = cleanInput(line);

        const cmd = commands[command];
        if(cmd)
        {
            try {
                await cmd.callback(state, ...args);
            }
            catch (e){
             console.log((e as Error).message);
             rl.prompt();
            }
        }
        else
        {
            console.log("unknown command")
            rl.prompt();
        }
    })
    rl.prompt();
    return {
        interface: rl,
        commands: null,
        pokeapi: pokeApi
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
            description: "",
            callback: commandExplore
        }
    }
}