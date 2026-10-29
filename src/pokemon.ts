export type Stat = {
    base_stat: number,
    effort: number,
    stat: { name: string, url: string}
}

export type Type = {

    slot: number,
    type: {name: string, url: string}
}

export type Pokemon = {
    id: number,
    name: string,
    base_experience: number,
    height: number,
    weight: number,
    stats: Stat[],
    types: Type[]
}