import { getDocuments, getDocumentsByRegion } from "../modules/database.js";
import { getServerById, IServer } from "../modules/client.js";

export async function getServers(region: string | null = null, limit: number = 0): Promise<IServer[]> {
    const servers: { [id: number]: number } = {};

    for await (const document of await (region ? getDocumentsByRegion(region) : getDocuments())) {
        if (!getServerById(document._id))
            continue;

        for (const record of document.records) {
            if (Object.keys(servers).includes(document._id.toString())) {
                servers[document._id] += record.players;
            } else {
                servers[document._id] = record.players;
            }
        }
    }

    let bestServers = Object.entries(servers).sort(([, a], [, b]) => b - a);

    if (limit !== 0)
        bestServers = bestServers.slice(0, limit);

    return bestServers.map(server => getServerById(parseInt(server[0])));
}

export async function getPlace(id: number, region: string | null = null): Promise<number> {
    const servers = await getServers(region);

    let place = -1;

    for (let i = 0; i < servers.length; i++) {
        if (servers[i].serverId === id) {
            place = i + 1;
            break;
        }
    }

    return place;
}