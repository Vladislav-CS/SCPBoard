import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getLastCacheUpdatedTime, getServerByIPAndPort } from '../../modules/client.js';
import { getFramework } from '../../utils/regex.js';
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
            await interaction.followUp(readLocalizationKey(interaction.locale, TranslationKey.ServerNotFound).replace('$0', address));
            return;
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
            )
            .setColor('#FEE75C')
            .setFooter({ text: readLocalizationKey(interaction.locale, TranslationKey.CacheUpdated).replace('$0', getLastCacheUpdatedTime().toString()) })
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] });
    },
}