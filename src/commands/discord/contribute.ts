import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getContributors, readLocalizationKey, TranslationKey } from "../../modules/localization.js";

export default {
    data: new SlashCommandBuilder()
        .setName('contribute')
        .setDescription('Displays information about how to contribute this bot'),
    async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
            .setTitle(readLocalizationKey(interaction.locale, TranslationKey.Contributors))
            .addFields(getContributors())
            .setColor('#FEE75C');

        await interaction.reply({ content: readLocalizationKey(interaction.locale, TranslationKey.Contribute), embeds: [embed] });
    }
}