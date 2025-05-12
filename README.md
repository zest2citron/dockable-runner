# Dockable Runner - Exemple

Ce dépôt est un exemple de projet compatible avec le système dockable-runner. Il contient plusieurs scripts qui peuvent être exécutés automatiquement dans un conteneur Docker via le système de boucle d'exécution.

## Structure du projet

```
.
├── runner.json       # Configuration du runner
├── scripts/         # Scripts exécutables
│   ├── main.py      # Script Python principal - collecte de données météo fictives
│   ├── backup.sh    # Script Bash pour sauvegarder les données
│   └── monitor.js   # Script Node.js pour surveiller les anomalies
└── data/            # Répertoire pour stocker les données
```

## Fonctionnalités

Ce dépôt démontre plusieurs fonctionnalités du système dockable-runner :

1. **Scripts multi-langages** : Exemples en Python, Bash et Node.js
2. **Gestion des dépendances** : Installation automatique via runner.json
3. **Variables d'environnement** : Configuration via des variables
4. **Persistance des données** : Stockage dans le répertoire /data
5. **Journalisation** : Logs détaillés des opérations

## Utilisation

Pour utiliser ce dépôt avec le système dockable-runner :

```bash
./launch_container.sh \
  --name weather-demo \
  --ssh-port 22001 \
  --vnc-port 5901 \
  --web-port 8081 \
  --git-repo /apps/novnc/app/gits/dockable-runner \
  --run-script scripts/main.py \
  --frequency 60
```

## Scripts disponibles

### 1. main.py
Collecte des données météo fictives et génère des rapports statistiques.

### 2. backup.sh
Sauvegarde les fichiers de données et maintient un historique limité.

### 3. monitor.js
Détecte les anomalies dans les données collectées.