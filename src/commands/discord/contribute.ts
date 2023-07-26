import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getTranslatorsMessage, readLocalizationKey, TranslationKey } from "../../modules/localization.js";

export default {
    data: new SlashCommandBuilder()
        .setName('contribute')
        .setDescription('Displays information about how to contribute this bot'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply(readLocalizationKey(interaction.locale, TranslationKey.Contribute) + getTranslatorsMessage());
    }
}