import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from 'discord.js';
import { getLastCacheUpdatedTime, isCacheUpdated } from '../../modules/client.js';
import { clearTags, removeFrameworkIfExists } from '../../utils/regex.js';
import { getServers } from "../../utils/leaderboard.js";

export default {
    cache: true,
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays leaderboard between servers')
        .addStringOption((option: SlashCommandStringOption) =>
            option.setName('region')
                .setDescription('Leaving this option blank will give you leaderboard of all servers')
                .setRequired(false)
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
        )
        .addIntegerOption((option: SlashCommandIntegerOption) =>
            option.setName('limit')
                .setDescription('How many servers will be in the leaderboard. Default value: 10')
                .setMinValue(1)
                .setMaxValue(25)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const region = interaction.options.getString('region');
        const limit = interaction.options.getInteger('limit') ?? 10;

        const servers = await getServers(region, limit);

        if (servers.length === 0) {
            await interaction.reply('No servers were found');
            return;
        }

        let description = '';

        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];

            let title = server.info;

            title = removeFrameworkIfExists(title);
            title = clearTags(title);

            title = title.split(' ').slice(0, 5).join(' ');
            description += `\n${i <= 2 ? '👑 ' : ''}**#${i + 1}** ${title} [${server.ip}:${server.port}]\n`
        }

        const embed = new EmbedBuilder()
            .setTitle(`Leaderboard ${region ?? "the whole game"}`)
            .setDescription(description)
            .setColor('Orange')
            .setFooter({ text: `Cache updated ${getLastCacheUpdatedTime()} seconds ago` })
            .setTimestamp();

        await interaction.followUp({ embeds: [embed] });
    }
}