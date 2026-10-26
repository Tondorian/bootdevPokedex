import { afterEach, describe, expect, test, vi } from 'vitest';
import { commandHelp } from '../src/command_help.js';
import type { CLICommand } from '../src/state.js';
import { createState, loggedLines } from './helpers.js';

afterEach(() => {
    vi.restoreAllMocks();
});

function command(name: string, description: string): CLICommand {
    return { name, description, callback: async () => {} };
}

describe('commandHelp', () => {
    test('prints the welcome message and the usage header', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state } = createState();

        await commandHelp(state);

        const lines = loggedLines(log);
        expect(lines[0]).toBe('Welcome to the Pokedex!');
        expect(lines[1]).toMatch(/^Usage:/);
    });

    test('lists every registered command with its description', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const { state } = createState({
            commands: {
                exit: command('exit', 'Exits the pokedex'),
                help: command('help', 'Displays a help message'),
                map: command('map', 'Displays the next 20 location areas'),
            },
        });

        await commandHelp(state);

        const lines = loggedLines(log);
        expect(lines).toContain('exit: Exits the pokedex');
        expect(lines).toContain('help: Displays a help message');
        expect(lines).toContain('map: Displays the next 20 location areas');
    });
});
