import { fromBase64 } from "../utils/base64.js";

import 'dotenv/config';

export interface IServer {
    serverId: number,
    accountId: number,
    ip: string,
    port: number,
    players: string,
    info: string,
    privateBeta: boolean,
    friendlyFire: boolean,
    modded: boolean,
    whitelist: boolean,
    isoCode: string,
    latitude: number,
    longitude: number,
}

let servers: IServer[] = [];
let cacheUpdatedTime: number;

export function run() {
    setInterval(async () => {
        await fetch(`https://api.scpslgame.com/lobbylist.php?key=${process.env.SCPSL_TOKEN}`)
            .then(async content => {
                if (content.status !== 200) {
                    return;
                }

                servers = JSON.parse(await content.text());
                cacheUpdatedTime = Date.now();

                for (let server of servers) {
                    server.info = fromBase64(server.info);
                }
            })
            .catch(console.error);
    }, 35000);
}

export function getServers(): IServer[] {
    return servers;
}

export function getServersByAccountId(accountId: number): IServer[] {
    return servers.filter(server => server.accountId === accountId);
}

export function getServersByRegion(isoCode: string): IServer[] {
    return servers.filter(server => server.isoCode === isoCode);
}

export function getServerById(id: number): IServer {
    return servers.find(server => server.serverId === id) as IServer;
}

export function getServersByIP(ip: string): IServer[] {
    return servers.filter(server => server.ip === ip);
}

export function getServerByIPAndPort(ip: string, port: string): IServer {
    return servers.find(server => server.ip === ip && server.port.toString() === port) as IServer;
}

export function isCacheUpdated(): boolean {
    return cacheUpdatedTime !== undefined;
}

export function getLastCacheUpdatedTime(): number {
    return Math.round((Date.now() - cacheUpdatedTime) / 1000);
}