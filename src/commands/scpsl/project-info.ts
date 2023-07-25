import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getLastCacheUpdatedTime, getServersByIP } from '../../modules/client.js';
import { getFramework } from '../../utils/regex.js';

export default {
    cache: true,
    data: new SlashCommandBuilder()
        .setName('project-info')
        .setDescription('Displays information about the project')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('IP-address of the project')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const ip = interaction.options.getString('ip') as string;
        const servers = getServersByIP(ip);

        if (!servers || servers.length === 0) {
            await interaction.reply('IP is wrong or the project does not exist.');
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
            .setTitle("Project Info")
            .addFields(
                { name: 'Account ID', value: project.accountId.toString(), inline: true },
                { name: 'Region', value: project.isoCode, inline: true },
                { name: 'Geolocation', value: `${project.latitude}, ${project.longitude}` },
                { name: 'IP', value: project.ip, inline: true },
                { name: 'Ports', value: servers.length > 3 ? `${servers.slice(0, 2).map(server => server.port).join(', ')}...` : servers.map(server => server.port).join(', '), inline: true },
                { name: 'Framework', value: getFramework(project.info) },
                { name: 'Number of servers', value: servers.length.toString(), inline: true },
                { name: 'Players', value: `${players}/${maxPlayers}`, inline: true }
            )
            .setColor('Orange')
            .setFooter({ text: `Cache updated ${getLastCacheUpdatedTime()} seconds ago` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
}