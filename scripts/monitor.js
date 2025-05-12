#!/usr/bin/env node
/**
 * Script d'exemple Node.js pour le système dockable-runner
 * Ce script surveille les fichiers de données et génère des alertes
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration via variables d'environnement
const DATA_DIR = process.env.DATA_DIR || './data';
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
const MAX_TEMP = parseFloat(process.env.MAX_TEMP || '30');
const MIN_TEMP = parseFloat(process.env.MIN_TEMP || '10');

// Configuration du logging
const logger = {
  info: (message) => {
    if (['INFO', 'DEBUG'].includes(LOG_LEVEL)) {
      console.log(`${new Date().toISOString()} - INFO - ${message}`);
    }
  },
  error: (message) => {
    console.error(`${new Date().toISOString()} - ERROR - ${message}`);
  },
  debug: (message) => {
    if (LOG_LEVEL === 'DEBUG') {
      console.log(`${new Date().toISOString()} - DEBUG - ${message}`);
    }
  }
};

// Vérifier que le répertoire existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  logger.info(`Répertoire de données créé: ${DATA_DIR}`);
}

/**
 * Analyse les fichiers de données pour détecter les anomalies
 */
function analyzeData() {
  logger.info('Analyse des données en cours...');
  
  try {
    // Liste tous les fichiers data_*.json
    const dataFiles = fs.readdirSync(DATA_DIR)
      .filter(file => file.startsWith('data_') && file.endsWith('.json'))
      .map(file => path.join(DATA_DIR, file));
    
    logger.info(`Nombre de fichiers trouvés: ${dataFiles.length}`);
    
    if (dataFiles.length === 0) {
      logger.info('Aucun fichier à analyser');
      return;
    }
    
    // Trie par date de modification (du plus récent au plus ancien)
    dataFiles.sort((a, b) => {
      return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
    });
    
    // Analyse les 10 fichiers les plus récents
    const recentFiles = dataFiles.slice(0, 10);
    const anomalies = [];
    
    recentFiles.forEach(file => {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        logger.debug(`Analysing file: ${path.basename(file)}`);
        
        // Vérifier les anomalies de température
        if (data.temperature > MAX_TEMP) {
          anomalies.push({
            file: path.basename(file),
            type: 'high_temperature',
            value: data.temperature,
            threshold: MAX_TEMP,
            timestamp: data.timestamp
          });
        } else if (data.temperature < MIN_TEMP) {
          anomalies.push({
            file: path.basename(file),
            type: 'low_temperature',
            value: data.temperature,
            threshold: MIN_TEMP,
            timestamp: data.timestamp
          });
        }
        
        // Autres vérifications d'anomalies peuvent être ajoutées ici
        
      } catch (err) {
        logger.error(`Erreur lors de l'analyse du fichier ${file}: ${err.message}`);
      }
    });
    
    // Générer un rapport d'anomalies
    if (anomalies.length > 0) {
      logger.info(`${anomalies.length} anomalie(s) détectée(s)`);
      
      // Écrire le rapport d'anomalies
      const reportFile = path.join(DATA_DIR, `anomalies_${new Date().toISOString().replace(/:/g, '-')}.json`);
      const report = {
        timestamp: new Date().toISOString(),
        hostname: os.hostname(),
        anomalies_count: anomalies.length,
        anomalies: anomalies
      };
      
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      logger.info(`Rapport d'anomalies écrit dans ${reportFile}`);
      
      // Afficher les anomalies
      anomalies.forEach(anomaly => {
        logger.info(`ALERTE: ${anomaly.type} - Valeur: ${anomaly.value} (seuil: ${anomaly.threshold}) - Fichier: ${anomaly.file}`);
      });
    } else {
      logger.info('Aucune anomalie détectée');
    }
    
  } catch (err) {
    logger.error(`Erreur lors de l'analyse des données: ${err.message}`);
    logger.error(err.stack);
  }
}

/**
 * Fonction principale
 */
function main() {
  logger.info('Démarrage du moniteur de données...');
  logger.info(`Répertoire des données: ${DATA_DIR}`);
  logger.info(`Seuils configurés - MAX: ${MAX_TEMP}°C, MIN: ${MIN_TEMP}°C`);
  
  try {
    analyzeData();
    logger.info('Analyse terminée');
  } catch (err) {
    logger.error(`Erreur lors de l'exécution: ${err.message}`);
    logger.error(err.stack);
  }
}

// Point d'entrée
main();
