import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Displays information about the bot'),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply('SCPBoard is a Discord bot which allows you to get information about server / project / region or the whole game.');
    }
}