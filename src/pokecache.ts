type CacheEntry<T> = {
    createdAt: number;
    val: T;
}

export class Cache {
    #cache = new Map<string, CacheEntry<any>>();
    #reapIntervalId: NodeJS.Timeout | undefined = undefined;
    #interval: number;

    constructor(interval: number) {
        this.#interval = interval;
        this.#startReapLoop();
    }

    stopReapLoop() {
        clearInterval(this.#reapIntervalId);
        this.#reapIntervalId = undefined;
    }

    add<T>(key: string, val: T) {
        this.#cache.set(key, {createdAt: Date.now(), val});
    }

    get<T>(key: string) : T | undefined {
        const entry = this.#cache.get(key);
        if(entry)
        {
            return entry.val as T;
        }
        return undefined;
    }

    #reap() {
        const interval = Date.now() - this.#interval;
        for(const [key, entry] of this.#cache.entries())
        {
            if(entry.createdAt <= interval)
            {
                this.#cache.delete(key);
            }
        }
    }

    #startReapLoop() {
        this.#reapIntervalId =  setInterval(this.#reap.bind(this), this.#interval);
    }
}
