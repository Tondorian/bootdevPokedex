import { afterEach, describe, expect, test, vi } from 'vitest';
import { Cache } from '../src/pokecache.js';

// A long interval keeps the reap loop out of the way for the plain add/get tests.
const NO_REAPING = 60_000;

describe('Cache', () => {
    test.concurrent.each([
        { key: 'string', val: 'charmander' },
        { key: 'number', val: 151 },
        { key: 'boolean', val: false },
        { key: 'object', val: { name: 'bulbasaur', id: 1 } },
    ])('add()/get() roundtrip for $key values', ({ key, val }) => {
        const cache = new Cache(NO_REAPING);
        try {
            cache.add(key, val);
            expect(cache.get(key)).toEqual(val);
        } finally {
            cache.stopReapLoop();
        }
    });

    test('get() returns undefined for a missing key', () => {
        const cache = new Cache(NO_REAPING);
        try {
            expect(cache.get('does-not-exist')).toBeUndefined();
        } finally {
            cache.stopReapLoop();
        }
    });

    test('add() overwrites an existing key', () => {
        const cache = new Cache(NO_REAPING);
        try {
            cache.add('key', 'old');
            cache.add('key', 'new');
            expect(cache.get('key')).toBe('new');
        } finally {
            cache.stopReapLoop();
        }
    });
});

describe('Cache reaping', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test('keeps entries that are younger than the interval', () => {
        vi.useFakeTimers();
        const cache = new Cache(1000);
        try {
            cache.add('key', 'value');

            vi.advanceTimersByTime(500);
            expect(cache.get('key')).toBe('value');
        } finally {
            cache.stopReapLoop();
        }
    });

    test('removes entries that are older than the interval', () => {
        vi.useFakeTimers();
        const cache = new Cache(1000);
        try {
            cache.add('key', 'value');

            // Fake timers start at 0, so the first reap tick lands exactly on
            // createdAt + interval. Advancing past the second tick makes the
            // entry strictly older than the interval.
            vi.advanceTimersByTime(2100);
            expect(cache.get('key')).toBeUndefined();
        } finally {
            cache.stopReapLoop();
        }
    });

    test('reaps only the expired entries', () => {
        vi.useFakeTimers();
        const cache = new Cache(100);
        try {
            cache.add('stale', 'old');

            vi.advanceTimersByTime(150); // reap tick at 100ms: nothing is expired yet
            cache.add('fresh', 'new');

            vi.advanceTimersByTime(100); // reap tick at 200ms: only 'stale' is expired
            expect(cache.get('stale')).toBeUndefined();
            expect(cache.get('fresh')).toBe('new');
        } finally {
            cache.stopReapLoop();
        }
    });

    test('stopReapLoop() prevents further reaping', () => {
        vi.useFakeTimers();
        const cache = new Cache(100);
        cache.add('key', 'value');
        cache.stopReapLoop();

        vi.advanceTimersByTime(10_000);
        expect(cache.get('key')).toBe('value');
    });

    test('reaps entries with a real timer', async () => {
        const cache = new Cache(10);
        try {
            cache.add('key', 'value');
            expect(cache.get('key')).toBe('value');

            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(cache.get('key')).toBeUndefined();
        } finally {
            cache.stopReapLoop();
        }
    });
});
