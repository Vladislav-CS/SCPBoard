import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getLastCacheUpdatedTime, getServerByIPAndPort } from '../../modules/client.js';
import { getFramework } from '../../utils/regex.js';
import { getDocumentById } from "../../modules/database.js";
import { getPlace } from "../../utils/leaderboard.js";
import { readLocalizationKey, TranslationKey } from '../../modules/localization.js';

export default {
    cache: true,
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Displays information about the server')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('IP-address of the server with port')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const address: string = interaction.options.getString('ip') as string;

        if (address.indexOf(':') === -1 || address.split(':').length !== 2) {
            await interaction.followUp(readLocalizationKey(interaction.locale, TranslationKey.InvalidServer));
            return;
        }

        const parts = address.split(':');

        const ip = parts[0];
        const port = parts[1];

        const server = getServerByIPAndPort(ip, port);

        if (!server) {
            await interaction.reply(readLocalizationKey(interaction.locale, TranslationKey.ServerNotFound).replace('$0', address));
            return;
        }

        const document = await getDocumentById(server.serverId);

        if (!document || document.records.length === 0) {
            await interaction.reply(readLocalizationKey(interaction.locale, TranslationKey.NoRecords));
            return;
        }

        let maxPlayers = 0, players = 0;

        for (const record of document.records) {
            if (record.players > maxPlayers)
                maxPlayers = record.players;

            if (record.players != 0)
                players += record.players;
        }

        const maxPlayersRecords = document.records.sort((a, b) => b.players - a.players).slice(0, 5);
        let hours = 0;

        for (const record of maxPlayersRecords) {
            hours += new Date(record.time).getHours();
        }

        const embed = new EmbedBuilder()
            .setTitle(readLocalizationKey(interaction.locale, TranslationKey.ServerInfo))
            .addFields(
                { name: readLocalizationKey(interaction.locale, TranslationKey.ServerId), value: server.serverId.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.AccountId), value: server.accountId.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Country), value: server.isoCode, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Geolocation), value: `${server.latitude}, ${server.longitude}` },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Address), value: server.ip, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Port), value: server.port.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Framework), value: getFramework(server.info) },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Players), value: server.players, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.ScpListLink), value: `[${server.serverId}](https://scplist.kr/servers/${server.serverId})`, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.PlaceTop), value: `${await getPlace(server.serverId)} | ${await getPlace(server.serverId, server.isoCode)}` },
                { name: readLocalizationKey(interaction.locale, TranslationKey.MaxPlayers), value: maxPlayers.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.AveragePlayers), value: Math.round(players / document.records.length).toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.PeakPlayers), value: `${Math.round(hours / maxPlayersRecords.length)}:00`, inline: true },
            )
            .setColor('#FEE75C')
            .setFooter({ text: readLocalizationKey(interaction.locale, TranslationKey.CacheUpdated).replace('$0', getLastCacheUpdatedTime().toString()) })
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] });
    },
}