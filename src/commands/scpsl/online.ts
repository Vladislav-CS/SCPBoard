import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getDocumentById } from "../../modules/database.js";
import { readLocalizationKey, TranslationKey } from '../../modules/localization.js';

export default {
    data: new SlashCommandBuilder()
        .setName('online')
        .setDescription('Displays how many players played at certain moment')
        .addIntegerOption(option =>
            option.setName('server-id')
                .setDescription('ID of the server')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('date')
                .setDescription('In Unix-time format. Example: 1690215681. Leave it 0 to get the first record')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const document = await getDocumentById(interaction.options.getInteger('server-id') as number);

        if (!document || document.records.length === 0) {
            await interaction.reply(readLocalizationKey(interaction.locale, TranslationKey.NoRecords));
            return;
        }

        const now = Date.now();
        const moment = interaction.options.getInteger('date') as number * 1000;

        const closeRecord = {
            time: now,
            difference: now,
            players: 0,
        };

        for (const record of document.records) {
            const difference = Math.abs(moment - record.time);

            if (difference < closeRecord.difference) {
                closeRecord.time = record.time;
                closeRecord.difference = difference;

                closeRecord.players = record.players;
            }
        }

        await interaction.reply(readLocalizationKey(interaction.locale, TranslationKey.LastRecord).replace('$0', Math.round(closeRecord.time / 1000).toString()).replace('$1', closeRecord.players.toString()));
    },
}