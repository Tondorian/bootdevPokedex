import { initState } from './state.js';

export function cleanInput(input: string) : string[] {
    return input.trim().toLowerCase().split(/\s/).filter((word) => word !== "");
}

export async function startREPL() {
    const state = initState();
    (await state).interface.prompt();
    
}