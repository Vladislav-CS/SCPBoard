import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getLastCacheUpdatedTime, getServerByIPAndPort } from '../../modules/client.js';
import { getFramework } from '../../utils/regex.js';
import { getDocumentById } from "../../modules/database.js";
import { getPlace } from "../../utils/leaderboard.js";

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
            await interaction.reply('IP is wrong or the project does not exist.');
            return;
        }

        const parts = address.split(':');

        const ip = parts[0];
        const port = parts[1];

        const server = getServerByIPAndPort(ip, port);

        if (!server) {
            await interaction.reply(`Server ${address} not found.`);
            return;
        }

        const document = await getDocumentById(server.serverId);

        if (!document || document.records.length === 0) {
            await interaction.reply('There are no records of this server');
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
            .setTitle("Server Info")
            .addFields(
                { name: 'Server ID', value: server.serverId.toString(), inline: true },
                { name: 'Account ID', value: server.accountId.toString(), inline: true },
                { name: 'Country', value: server.isoCode, inline: true },
                { name: 'Geolocation', value: `${server.latitude}, ${server.longitude}` },
                { name: 'IP', value: server.ip, inline: true },
                { name: 'Port', value: server.port.toString(), inline: true },
                { name: 'Framework', value: getFramework(server.info) },
                { name: 'Players', value: server.players, inline: true },
                { name: 'scplist.kr', value: `[${server.serverId}](https://scplist.kr/servers/${server.serverId})`, inline: true },
                { name: 'Place in the top | region', value: `${await getPlace(server.serverId)} | ${await getPlace(server.serverId, server.isoCode)}` },
                { name: 'Max players', value: maxPlayers.toString(), inline: true },
                { name: 'Average players', value: Math.round(players / document.records.length).toString(), inline: true },
                { name: 'Peak players', value: `${Math.round(hours / maxPlayersRecords.length)}:00`, inline: true },
            )
            .setColor('Orange')
            .setFooter({ text: `Cache updated ${getLastCacheUpdatedTime()} seconds ago` })
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] });
    },
}