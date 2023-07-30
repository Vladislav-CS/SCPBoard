import { CommandInteraction, Events } from "discord.js";
import { isCacheUpdated } from "../modules/client.js";
import { readLocalizationKey, TranslationKey } from "../modules/localization.js";

export default {
    name: Events.InteractionCreate,
    async execute(interaction: CommandInteraction) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        if (command.cache && !isCacheUpdated()) {
            await interaction.reply(readLocalizationKey(interaction.locale, TranslationKey.CacheNotUpdated));
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}\n${error}`);
        }
    },
}