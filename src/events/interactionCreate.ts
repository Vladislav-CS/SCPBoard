import { CommandInteraction, Events } from "discord.js";
import { isCacheUpdated } from "../modules/client.js";

export default {
    name: Events.InteractionCreate,
    async execute(interaction: CommandInteraction) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        if (command.cache && !isCacheUpdated()) {
            await interaction.reply('Cache is not updated, wait about 30 seconds.');
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command, please try again!' });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command, please try again!' });
            }

            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
}