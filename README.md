# Speed Test V1

Application Windows 10/11 x64 par XT.07. Interface française sombre, logo Tux (Linux), débits descendant et montant, ping HTTP et gigue.

## Installation

Télécharger l'installateur dans [Releases](https://github.com/xt0725/Speed-Test-V1/releases), puis exécuter `Speed-Test-V1-Setup-1.0.0.exe`. L'assistant personnalisé permet de choisir le dossier et crée un raccourci. Aucune installation de Node.js ou Python n'est nécessaire pour l'utilisateur. Désinstallation depuis les paramètres Windows.

## Confidentialité

L'IP publique reste masquée. Le bouton « Afficher mon IP » ouvre une confirmation native avec Annuler sélectionné par défaut. L'adresse est récupérée uniquement après confirmation, puis remasquée après 30 secondes, au changement de fenêtre ou au lancement d'un test. Aucune IP ni résultat n'est écrit sur disque et aucun historique n'est conservé. Les appels réseau sont effectués par le processus principal, la page ne dispose d'aucun accès réseau ou Node.js.

Le service Cloudflare voit nécessairement l'IP de la connexion lors du test : masquer l'IP dans l'interface n'est pas un VPN. Le test ne démarre jamais automatiquement.

## Mesures

Cloudflare `speed.cloudflare.com` est contacté en HTTPS. Le ping affiché est une latence HTTP (médiane de huit requêtes après échauffement), pas un ping ICMP de jeu. La gigue représente la moyenne des écarts entre latences consécutives. Débit = octets transférés / durée totale, converti en Mbps décimaux. Transferts adaptatifs, un seul flux : mesure indicative, susceptible de sous-estimer une connexion très rapide. Jusqu'à environ 230 Mo par test. L'annulation interrompt les requêtes; aucun résultat incomplet n'est présenté comme définitif.

## Développement et compilation

Node.js 22 ou plus récent :

```sh
npm ci
npm test
npm start
npm run dist -- --publish never
```

La compilation Windows via GitHub Actions intègre Tux dans l'exécutable, l'installateur et le raccourci. Chaque push sur main produit un artefact téléchargeable et publie l'installateur dans la release correspondant à la version de package.json. Les tags `v*` peuvent également déclencher une publication.

Sous Linux, `npm run dist:cross` compile le programme et l'assistant NSIS personnalisé, avec Tux intégré dans les ressources de l'exécutable. NSIS doit être disponible dans le cache electron-builder ou via la variable MAKENSIS. Le script génère un désinstalleur qui supprime explicitement les fichiers de l'application.

## Mise sur GitHub

Créer un dépôt `Speed-Test-V1` initialisé avec README, puis importer les fichiers (y compris `.github/workflows/windows.yml`). Ou, avec GitHub CLI connecté :

```sh
git init -b main
git add .
git commit -m "Create Speed Test V1"
gh repo create Speed-Test-V1 --private --source=. --remote=origin --push
git tag v1.0.0
git push origin v1.0.0
```

Installer non signé : Windows peut afficher SmartScreen. La signature authentifiée nécessite un certificat de signature de code. Les mesures et l'installation finale doivent être validées sur un vrai PC Windows.

Voir THIRD_PARTY_NOTICES.md pour les crédits du logo.
