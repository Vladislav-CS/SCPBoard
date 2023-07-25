import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from "node:url";
import { defaultDynamicImport } from './utils/imports.js';

import 'dotenv/config';

const commands = [];

const foldersPath = fileURLToPath(new URL('commands', import.meta.url));
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = await defaultDynamicImport(filePath);

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const rest = new REST().setToken(process.env.TOKEN as string);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data: Array<any> = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID as string), { body: commands }) as Array<any>;

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();