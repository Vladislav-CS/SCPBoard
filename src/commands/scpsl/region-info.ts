import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { getLastCacheUpdatedTime, getServersByRegion } from '../../modules/client.js';
import { readLocalizationKey, TranslationKey } from "../../modules/localization.js";

export default {
    cache: true,
    data: new SlashCommandBuilder()
        .setName('region-info')
        .setDescription('Displays information about the region')
        .addStringOption((option: SlashCommandStringOption) =>
            option.setName('region')
                .setDescription('The region you want to know information about')
                .setRequired(true)
                .addChoices(
                    { name: 'RU', value: 'RU' },
                    { name: 'DE', value: 'DE' },
                    { name: 'FR', value: 'FR' },
                    { name: 'GB', value: 'GB' },
                    { name: 'UA', value: 'UA' },
                    { name: 'FI', value: 'FI' },
                    { name: 'PL', value: 'PL' },
                    { name: 'RO', value: 'RO' },
                    { name: 'CZ', value: 'CZ' },
                    { name: 'HU', value: 'HU' },
                    { name: 'NO', value: 'NO' },
                    { name: 'RS', value: 'RS' },
                    { name: 'AT', value: 'AT' },
                    { name: 'TR', value: 'TR' },
                    { name: 'NL', value: 'NL' },
                    { name: 'IT', value: 'IT' },
                    { name: 'ES', value: 'ES' },
                    { name: 'SP', value: 'SP' },
                    { name: 'CN', value: 'CN' },
                    { name: 'CA', value: 'CA' },
                    { name: 'KR', value: 'KR' },
                    { name: 'US', value: 'US' },
                    { name: 'JP', value: 'JP' },
                    { name: 'CL', value: 'CL' },
                    { name: 'AU', value: 'AU' },
                )
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const regionChosen = interaction.options.getString('region') as string;
        const servers = getServersByRegion(regionChosen);

        if (!servers || servers.length === 0) {
            await interaction.reply(readLocalizationKey(interaction.locale, TranslationKey.RegionNotFound).replace('$0', regionChosen));
            return;
        }

        const region = {
            servers: 0,
            players: 0,
            maxPlayers: 0,
            vanilla: 0,
            modded: 0,
            whitelisted: 0,
            friendlyFire: 0,
            privateBeta: 0,
        };

        for (const server of servers) {
            region.servers++;

            const online = server.players.split('/');

            region.players += parseInt(online[0]);
            region.maxPlayers += parseInt(online[1]);

            if (server.modded) {
                region.modded++;
            } else {
                region.vanilla++;
            }

            if (server.whitelist)
                region.whitelisted++;

            if (server.friendlyFire)
                region.friendlyFire++;

            if (server.privateBeta)
                region.privateBeta++;
        }

        const embed = new EmbedBuilder()
            .setTitle(readLocalizationKey(interaction.locale, TranslationKey.RegionInfo))
            .addFields(
                { name: readLocalizationKey(interaction.locale, TranslationKey.Servers), value: region.servers.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Players), value: `${region.players}/${region.maxPlayers}`, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Country), value: regionChosen },
                { name: readLocalizationKey(interaction.locale, TranslationKey.FriendlyFire), value: region.friendlyFire.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Vanilla), value: region.vanilla.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Whitelisted), value: region.whitelisted.toString() },
            )
            .setColor('#FEE75C')
            .setFooter({ text: readLocalizationKey(interaction.locale, TranslationKey.CacheUpdated).replace('$0', getLastCacheUpdatedTime().toString()) })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
}