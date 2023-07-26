import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getLastCacheUpdatedTime, getServers } from '../../modules/client.js';
import { TranslationKey, readLocalizationKey } from "../../modules/localization.js";

export default {
    cache: true,
    data: new SlashCommandBuilder()
        .setName('game-info')
        .setDescription('Displays information about the whole game'),
    async execute(interaction: ChatInputCommandInteraction) {
        const game = {
            servers: 0,
            players: 0,
            maxPlayers: 0,
            vanilla: 0,
            modded: 0,
            whitelisted: 0,
            friendlyFire: 0,
            privateBeta: 0,
        };

        const servers: any = {};
        const projects: any = {};

        for (const server of getServers()) {
            game.servers++;

            const online = server.players.split('/');

            game.players += parseInt(online[0]);
            game.maxPlayers += parseInt(online[1]);

            if (Object.keys(servers).includes(server.isoCode)) {
                servers[server.isoCode] += 1;
            } else {
                servers[server.isoCode] = 1;
            }

            if (Object.keys(projects).includes(server.isoCode)) {
                if (!projects[server.isoCode].includes(server.accountId)) {
                    projects[server.isoCode].push(server.accountId);
                }
            } else {
                projects[server.isoCode] = [server.accountId];
            }

            if (server.modded) {
                game.modded++;
            } else {
                game.vanilla++;
            }

            if (server.whitelist)
                game.whitelisted++;

            if (server.friendlyFire)
                game.friendlyFire++;

            if (server.privateBeta)
                game.privateBeta++;
        }

        const greaterServers = Object.keys(servers).reduce((a, b) => servers[a] > servers[b] ? a : b);
        const greaterProjects = Object.keys(projects).reduce((a, b) => projects[a].length > projects[b].length ? a : b)

        const lessServers = Object.keys(servers).reduce((a, b) => servers[a] < servers[b] ? a : b);
        const lessProjects = Object.keys(projects).reduce((a, b) => projects[a].length < projects[b].length ? a : b);

        const embed = new EmbedBuilder()
            .setTitle(readLocalizationKey(interaction.locale, TranslationKey.GameInfo))
            .addFields(
                { name: readLocalizationKey(interaction.locale, TranslationKey.Servers), value: game.servers.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Players), value: `${game.players}/${game.maxPlayers}`, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Vanilla), value: game.vanilla.toString() },
                { name: readLocalizationKey(interaction.locale, TranslationKey.GreaterServers), value: `${greaterServers} (${servers[greaterServers]})`, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.LessServers), value: `${lessServers} (${servers[lessServers]})`, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Modded), value: game.modded.toString() },
                { name: readLocalizationKey(interaction.locale, TranslationKey.GreaterCommunities), value: `${greaterProjects} (${projects[greaterProjects].length})`, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.LessCommunities), value: `${lessProjects} (${projects[lessProjects].length})`, inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.Whitelisted), value: game.whitelisted.toString() },
                { name: readLocalizationKey(interaction.locale, TranslationKey.FriendlyFire), value: game.friendlyFire.toString(), inline: true },
                { name: readLocalizationKey(interaction.locale, TranslationKey.PrivateBeta), value: game.privateBeta.toString(), inline: true },
            )
            .setColor('#FEE75C')
            .setFooter({ text: readLocalizationKey(interaction.locale, TranslationKey.CacheUpdated).replace('$0', getLastCacheUpdatedTime().toString()) })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}