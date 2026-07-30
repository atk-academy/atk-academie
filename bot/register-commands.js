import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
    .setName('annonce')
    .setDescription("Publie une annonce dans le salon annonce, au nom d'ATK Bot")
    .toJSON(),
  new SlashCommandBuilder()
    .setName('match')
    .setDescription('Enregistre le résultat d\'un match (BO3) dans le classement du site')
    .addStringOption(o => o.setName('joueur1').setDescription('Pseudo du joueur 1').setRequired(true))
    .addStringOption(o => o.setName('joueur2').setDescription('Pseudo du joueur 2').setRequired(true))
    .addIntegerOption(o => o.setName('rounds1').setDescription('Rounds gagnés par le joueur 1').setRequired(true))
    .addIntegerOption(o => o.setName('rounds2').setDescription('Rounds gagnés par le joueur 2').setRequired(true))
    .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const guildId = process.env.GUILD_ID;

try {
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: commands });
    console.log('Commandes /annonce et /match enregistrées pour ce serveur (instantané).');
  } else {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('Commandes enregistrées globalement (peut prendre jusqu\'à 1h à apparaître).');
  }
} catch (err) {
  console.error(err);
}
