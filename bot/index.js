import 'dotenv/config';
import {
  Client, GatewayIntentBits, ModalBuilder, TextInputBuilder,
  TextInputStyle, ActionRowBuilder, EmbedBuilder
} from 'discord.js';
import admin from 'firebase-admin';

// --- Firebase Admin (pour /match : écrit dans la même base que le site) ---
let db = null;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const sa = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    db = admin.firestore();
    console.log('Firebase Admin initialisé.');
  } else {
    console.log('FIREBASE_SERVICE_ACCOUNT absent — /match désactivé (seul /annonce fonctionnera).');
  }
} catch (e) { console.error('Firebase Admin init échec:', e.message); }

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => console.log(`ATK Bot connecté en tant que ${client.user.tag}`));

client.on('interactionCreate', async (interaction) => {
  // /annonce → ouvre une fenêtre pour écrire le message
  if (interaction.isChatInputCommand() && interaction.commandName === 'annonce') {
    const modal = new ModalBuilder().setCustomId('annonceModal').setTitle('Nouvelle annonce ATK');
    const input = new TextInputBuilder()
      .setCustomId('annonceMessage').setLabel('Ton message')
      .setStyle(TextInputStyle.Paragraph).setPlaceholder('Écris ton annonce ici...')
      .setRequired(true).setMaxLength(3500);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId === 'annonceModal') {
    const text = interaction.fields.getTextInputValue('annonceMessage');
    const channel = await client.channels.fetch(process.env.ANNOUNCE_CHANNEL_ID);
    if (!channel) { await interaction.reply({ content: "Salon d'annonce introuvable.", ephemeral: true }); return; }
    const embed = new EmbedBuilder().setColor(0xff4136).setDescription(text).setFooter({ text: 'ATK' });
    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Annonce publiée.', ephemeral: true });
    return;
  }

  // /match → enregistre un duel dans le classement du site
  if (interaction.isChatInputCommand() && interaction.commandName === 'match') {
    if (!db) { await interaction.reply({ content: '⚠️ /match non configuré (clé Firebase manquante).', ephemeral: true }); return; }
    const p1 = interaction.options.getString('joueur1').trim();
    const p2 = interaction.options.getString('joueur2').trim();
    const r1 = interaction.options.getInteger('rounds1');
    const r2 = interaction.options.getInteger('rounds2');
    if (r1 === r2) { await interaction.reply({ content: 'Un match ne peut pas finir à égalité.', ephemeral: true }); return; }
    const winner = r1 > r2 ? p1 : p2;
    // saison active
    let season = 1;
    try { const cfg = await db.collection('meta').doc('config').get(); if (cfg.exists && cfg.data().season) season = cfg.data().season; } catch {}
    await db.collection('duels').add({
      p1, p2, roundsWonP1: r1, roundsWonP2: r2, winner, rounds: [], at: Date.now(), season
    });
    await interaction.reply({ content: `✅ Match enregistré : **${winner}** gagne ${Math.max(r1,r2)}-${Math.min(r1,r2)}.` });
    return;
  }
});

client.login(process.env.BOT_TOKEN);
