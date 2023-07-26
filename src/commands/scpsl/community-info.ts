import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getLastCacheUpdatedTime, getServersByIP } from '../../modules/client.js';
import { getFramework } from '../../utils/regex.js';
import { readLocalizationKey, TranslationKey } from '../../modules/localization.js';

export default {
    cache: true,
    data: new SlashCommandBuilder()
        .setName('community-info')
        .setDescription('Displays information about the community')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('IP address of the community')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const ip = interaction.options.getString('ip') as string;
        const servers = getServersByIP(ip);

        if (!servers || servers.length === 0) {
            await interaction.reply(readLocalizationKey(interaction.locale, TranslationKey.InvalidCommunity));
            return;
        }

        let players = 0, maxPlayers = 0;
        const project = servers[0];

        for (const server of servers) {
            const online = server.players.split('/');

            players += parseInt(online[0]);
            maxPlayers += parseInt(online[1]);
        }

        const embed = new EmbedBuilder()
            .setTitle(readLocalizationKey(interaction.locale, TranslationKey.CommunityInfo))
            .addFields(
                { name: readLocalizationKey(interaction.locale, TranslationKey.AccountId), value: project.accountId.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Region), value: project.isoCode, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Geolocation), value: `${project.latitude}, ${project.longitude}` },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Address), value: project.ip, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Ports), value: servers.length > 3 ? `${servers.slice(0, 2).map(server => server.port).join(', ')}...` : servers.map(server => server.port).join(', '), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Framework), value: getFramework(project.info) },
                { name: readLocalizationKey(interaction.locale, TranslationKey.TotalServers), value: servers.length.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Players), value: `${players}/${maxPlayers}`, inline: true }
            )
            .setColor('#FEE75C')
            .setFooter({ text: readLocalizationKey(interaction.locale, TranslationKey.CacheUpdated).replace('$0', getLastCacheUpdatedTime().toString()) })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
}