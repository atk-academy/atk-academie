# ATK Academy — notes opérationnelles

Site statique servi par GitHub Pages : https://atk-academy.github.io/atk-academie/

## Principe de travail

**Sois autonome.** Tout ce qui suit (lecture et écriture Firestore, déploiement)
se fait en ligne de commande. N'envoie pas l'utilisateur cliquer dans la console
Firebase ou dans l'interface GitHub : fais-le, puis vérifie et rends compte.

Si une commande est bloquée par les permissions, dis précisément laquelle plutôt
que de rabattre la tâche sur une manipulation manuelle.

## Base de données — Firestore REST

Projet `atk-academy-recrutement`, collection `candidates`.
Le site écrit **sans compte utilisateur** : il se connecte en anonyme. On fait pareil.

La clé API est une clé client Firebase, déjà publique dans le HTML déployé —
ce n'est pas un secret, mais on ne la recopie pas en dur, on l'extrait :

```bash
KEY=$(grep -o 'apiKey: *"[^"]*"' recrutement.html | head -1 | sed 's/.*"\(.*\)"/\1/')
PROJ=atk-academy-recrutement
TOKEN=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$KEY" \
  -H 'Content-Type: application/json' -d '{"returnSecureToken":true}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['idToken'])")
```

Lire la collection :

```bash
curl -s "https://firestore.googleapis.com/v1/projects/$PROJ/databases/(default)/documents/candidates?pageSize=300" \
  -H "Authorization: Bearer $TOKEN"
```

Modifier un champ (ici `accessCode`) sans écraser le reste du document :

```bash
curl -s -X PATCH \
  "https://firestore.googleapis.com/v1/projects/$PROJ/databases/(default)/documents/candidates/<DOC_ID>?updateMask.fieldPaths=accessCode" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"fields":{"accessCode":{"stringValue":"XXXXXX"}}}'
```

`updateMask.fieldPaths` est obligatoire : sans lui, le PATCH remplace tout le document.
Toujours relire après écriture pour confirmer.

## Codes d'accès candidats

Le joueur consulte son suivi avec **gamertag + code à 6 caractères**.

- Alphabet exact : `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — ni I, ni O, ni 0, ni 1.
- Vérifier l'unicité du code contre tous les candidats avant de l'écrire.
- La recherche côté joueur fait `filter(...)[0]` : elle retient **la première**
  fiche au gamertag correspondant. Si un joueur a plusieurs fiches (doublon de
  candidature), poser **le même code sur toutes**, sinon il y a une chance sur
  deux que ça échoue selon l'ordre de chargement.
- Le gamertag est comparé en minuscules mais sur la chaîne entière : une
  correspondance partielle ne passe pas. Vérifier l'orthographe exacte en base.

## Déploiement

```bash
GIT_SSH_COMMAND="ssh -i ~/.ssh/atk_academy_deploy -o StrictHostKeyChecking=no" git push origin main
```

- La clé de déploiement n'existe que sur la machine. Sur une nouvelle machine,
  en générer une et l'ajouter aux deploy keys du dépôt (ne jamais la transférer).
- `.git/HEAD` a déjà disparu plusieurs fois avant un push. Si git dit que ce
  n'est pas un dépôt : `printf 'ref: refs/heads/main\n' > .git/HEAD`.
- GitHub Pages met ~20 à 60 s à reconstruire. Vérifier en ligne avant d'annoncer
  que c'est déployé, avec un paramètre anti-cache :
  `curl -s "https://atk-academy.github.io/atk-academie/atk-duel.html?cb=$RANDOM"`
- Les en-têtes de cache sont agressifs : si l'utilisateur ne voit pas le
  changement, lui faire faire `Cmd + Shift + R` avant de chercher ailleurs.

## Particularités du code

- `atk-duel.html` — onglets via `data-view` + `<div id="view-...">`. L'onglet
  Équipages contient deux sous-vues (`data-sub`) : générateur d'équipages et wheel.
  Un canvas masqué ne peut pas se dimensionner : au passage sur la wheel, un
  `resize` est émis pour qu'elle se redessine.
- `recrutement.html` — colonnes d'assignation dans `ASSIGNATION_COLUMNS`.
  La `key` indexe les candidatures déjà assignées : pour renommer un recruteur,
  changer **uniquement le `label`**, jamais la `key`.
- Ces pages n'ont pas de `meta viewport` : les téléphones les rendent à ~980 px
  puis réduisent. En ajouter un changerait tout le rendu mobile — demander avant.
