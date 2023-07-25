import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getLastCacheUpdatedTime, getServers, isCacheUpdated } from '../../modules/client.js';

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
            .setTitle("Game Info")
            .addFields(
                { name: 'Servers', value: game.servers.toString(), inline: true },
                { name: 'Players', value: `${game.players}/${game.maxPlayers}`, inline: true },
                { name: 'Vanilla', value: game.vanilla.toString() },
                { name: 'Greater servers', value: `${greaterServers} (${servers[greaterServers]})`, inline: true },
                { name: 'Less servers', value: `${lessServers} (${servers[lessServers]})`, inline: true },
                { name: 'Modded', value: game.modded.toString() },
                { name: 'Greater projects', value: `${greaterProjects} (${projects[greaterProjects].length})`, inline: true },
                { name: 'Less projects', value: `${lessProjects} (${projects[lessProjects].length})`, inline: true },
                { name: 'Whitelisted', value: game.whitelisted.toString() },
                { name: 'Friendly Fire', value: game.friendlyFire.toString(), inline: true },
                { name: 'Private Beta', value: game.privateBeta.toString(), inline: true },
            )
            .setColor('Orange')
            .setFooter({ text: `Cache updated ${getLastCacheUpdatedTime()} seconds ago` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}