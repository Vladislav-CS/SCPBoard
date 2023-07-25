import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, Collection, IntentsBitField, Partials } from 'discord.js';
import { defaultDynamicImport, dynamicImport } from './utils/imports.js';

import 'dotenv/config';

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, any>
    }
}

const intents: IntentsBitField[] = [];
const partials: Partials[] = [];

const client = new Client({ intents: intents, partials: partials });

client.commands = new Collection();

const foldersPath = fileURLToPath(new URL('commands', import.meta.url));
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = await defaultDynamicImport(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

const eventsPath = fileURLToPath(new URL('events', import.meta.url));
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.ts'));

for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await defaultDynamicImport(filePath);

    try {
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    } catch (error) {
        console.error(`Error handling ${event.name}`);
        console.error(error);
    }
}

const modulesPath = fileURLToPath(new URL('modules', import.meta.url));
const moduleFiles = readdirSync(modulesPath).filter(file => file.endsWith('.ts'));

for (const file of moduleFiles) {
    const filePath = join(modulesPath, file);
    const module = await dynamicImport(filePath);

    try {
        module.run();
    } catch (error) {
        console.error(`Error running ${filePath}`);
        console.error(error);
    }
}

client.login(process.env.TOKEN).then(() => {
    console.log('Bot started!')
});