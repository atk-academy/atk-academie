# ATK Bot — /annonce et /match

Bot Discord qui :
- **/annonce** → ouvre une fenêtre, tu écris ton message, il le poste dans le salon annonce **au nom du bot** (pas ton compte).
- **/match joueur1 joueur2 rounds1 rounds2** → enregistre un match directement dans le classement du site.

⚠️ Deux étapes ne peuvent être faites que par toi (elles impliquent des identifiants secrets) : créer le bot + récupérer le token, et héberger le bot.

## 1. Créer le bot (ton compte Discord)
1. https://discord.com/developers/applications → **New Application** → nomme-la **ATK Bot** (coche les conditions, clique Créer).
2. Onglet **Bot** → **Reset Token** → copie le token (garde-le SECRET).
3. Onglet **General Information** → copie l'**Application ID** (= CLIENT_ID).

## 2. Inviter le bot
Onglet **OAuth2 → URL Generator** → coche `bot` + `applications.commands`, permissions `Send Messages` + `Embed Links` → ouvre l'URL générée → choisis ton serveur → Autoriser.

## 3. IDs Discord
Discord → Paramètres → Avancés → **Mode développeur** ON. Puis clic droit sur le salon annonce → **Copier l'identifiant** (ANNOUNCE_CHANNEL_ID). Clic droit sur ton serveur → Copier l'identifiant (GUILD_ID).

## 4. Config
Copie `.env.example` en `.env` et remplis BOT_TOKEN, CLIENT_ID, ANNOUNCE_CHANNEL_ID, GUILD_ID.

## 5. Héberger (gratuit, ex. Railway)
1. https://railway.app → New Project → Deploy from GitHub (ce dossier `bot`).
2. Ajoute les variables (mêmes clés que `.env`).
3. Commande de démarrage : `npm install && npm run register && npm start`.

## 6. (Optionnel) Activer /match
`/match` écrit dans la base Firestore, il faut une clé de compte de service :
1. Console Firebase → Paramètres du projet → **Comptes de service** → **Générer une nouvelle clé privée** → télécharge le JSON.
2. Encode-le en base64 : `base64 -i cle.json | pbcopy` (Mac).
3. Colle le résultat dans la variable `FIREBASE_SERVICE_ACCOUNT`.

Sans cette clé, `/annonce` fonctionne quand même ; seul `/match` est désactivé.
