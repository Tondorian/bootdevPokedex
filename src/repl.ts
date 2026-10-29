import { initState } from './state';

export function cleanInput(input: string) : string[] {
    return input.trim().toLowerCase().split(/\s/).filter((word) => word !== "");
}

export async function startREPL() {
    const state = await initState();
    state.interface.prompt();
}