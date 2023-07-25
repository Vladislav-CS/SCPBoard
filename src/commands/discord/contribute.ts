import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('contribute')
        .setDescription('Displays information about how to contribute this bot'),
    async execute(interaction: ChatInputCommandInteraction) {
        let answer = 'If you would like to contribute it, you can update or add your native language to this bot! Click [here]() to read README.';
        answer += '\nCurrent contributors:\n';

        // translators

        await interaction.reply(answer);
    }
}