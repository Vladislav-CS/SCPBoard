import { connect, Model, model, Schema } from 'mongoose';
import { getServers } from "./clien.jst";

import 'dotenv/config';

export interface IServer {
    _id: number,
    isoCode: string,
    records: Array<IRecord>
}

export interface IRecord {
    players: number,
    time: number,
}

const ServerSchema = new Schema<IServer>({
    _id: Number,
    isoCode: String,
    records: Array<IRecord>,
}, {
    versionKey: false
});

const Server: Model<IServer> = model<IServer>('servers', ServerSchema);

export async function run() {
    await connect(process.env.CONNECTION_STRING as string);

    setInterval(async () => {
        for (const server of getServers()) {
            const document = await Server.findById(server.serverId);
            const record: IRecord = {
                players: parseInt(server.players.split('/')[0]),
                time: Date.now(),
            };

            if (document) {
                document.records.push(record);
                const update = {
                    $set: {
                        records: document.records,
                    },
                }

                await Server.findOneAndUpdate({ _id: server.serverId }, update);
            } else {
                const object = new Server({
                    _id: server.serverId,
                    isoCode: server.isoCode,
                    records: [record],
                });

                await object.save();
            }
        }
    }, 40000);
}

export async function getDocumentById(id: number) {
    return Server.findById(id);
}

export async function getDocuments() {
    return Server.find({});
}