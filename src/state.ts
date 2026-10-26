import { createInterface, Interface } from "readline"
import { commandExit } from './command_exit.js';
import { commandHelp } from './command_help.js';
import { commandExplore } from './command_explore.js'
import { commandMap, commandMapB } from "./command_map.js";
import { PokeAPI } from "./pokeapi.js";

export type CLICommand = {
    name: string,
    description: string,
    callback: (state: State) => Promise<void> 
} 

export type State = {
    interface: Interface,
    commands: Record<string, CLICommand>,
    pokeApi: PokeAPI,
    nextLocationURL: string,
    prevLocationURL: string
}

export async function initState() {
    const rl = createInterface({input: process.stdin, output: process.stdout, prompt: "Pokedex > "})
    const pokeApi = new PokeAPI;
    const state: State = {interface: rl, commands: getCommands(), pokeApi, prevLocationURL: "", nextLocationURL: ""};
    
    rl.on("line", (line) => {
        const commands = getCommands();
        const cmd = commands[line.split(" ")[0]];
        if(cmd)
        {
            try {
                cmd.callback(state);
            }
            catch (e){
             console.log((e as Error).message);
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
        commands: null
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