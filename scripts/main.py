#!/usr/bin/env python3
"""
Exemple de script Python pour le système dockable-runner
Ce script collecte des données fictives et les stocke dans un fichier
"""

import os
import json
import time
import random
import logging
from datetime import datetime
import traceback

# Configuration du logging
log_level = os.environ.get("LOG_LEVEL", "INFO")
logging.basicConfig(
    level=getattr(logging, log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("demo-runner")

# Variables d'environnement
DATA_DIR = os.environ.get("DATA_DIR", "./data")
MAX_RETRIES = int(os.environ.get("MAX_RETRIES", 3))
API_KEY = os.environ.get("EXAMPLE_API_KEY", "default-key")

# Créer le répertoire de données s'il n'existe pas
os.makedirs(DATA_DIR, exist_ok=True)

def collect_fake_data():
    """Collecte des données fictives (simulation d'une API)"""
    # Simuler un appel API
    logger.info("Collecte de données en cours...")
    
    # Simuler un délai réseau
    time.sleep(2)
    
    # Générer des données aléatoires
    data = {
        "timestamp": datetime.now().isoformat(),
        "temperature": round(random.uniform(15, 35), 1),
        "humidity": round(random.uniform(30, 90), 1),
        "wind_speed": round(random.uniform(0, 100), 1),
        "pressure": round(random.uniform(990, 1030), 1),
        "status": random.choice(["sunny", "cloudy", "rainy", "windy", "stormy"])
    }
    
    logger.info(f"Données collectées: {data}")
    return data

def save_data(data):
    """Sauvegarde les données dans un fichier JSON"""
    now = datetime.now()
    filename = os.path.join(DATA_DIR, f"data_{now.strftime('%Y%m%d_%H%M%S')}.json")
    
    try:
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        logger.info(f"Données sauvegardées dans {filename}")
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la sauvegarde des données: {e}")
        return False

def generate_report():
    """Génère un rapport basé sur les données collectées"""
    try:
        # Lister tous les fichiers de données
        data_files = [f for f in os.listdir(DATA_DIR) if f.startswith('data_') and f.endswith('.json')]
        
        if not data_files:
            logger.warning("Aucune donnée disponible pour générer un rapport")
            return
        
        # Charger toutes les données
        all_data = []
        for file in data_files[-10:]:  # Prend les 10 derniers fichiers
            try:
                with open(os.path.join(DATA_DIR, file), 'r') as f:
                    all_data.append(json.load(f))
            except Exception as e:
                logger.error(f"Erreur lors de la lecture du fichier {file}: {e}")
        
        # Générer des statistiques simples
        if all_data:
            temps = [d['temperature'] for d in all_data]
            humid = [d['humidity'] for d in all_data]
            
            report = {
                "timestamp": datetime.now().isoformat(),
                "data_points": len(all_data),
                "avg_temperature": sum(temps) / len(temps),
                "avg_humidity": sum(humid) / len(humid),
                "latest_status": all_data[-1]['status']
            }
            
            # Sauvegarder le rapport
            report_file = os.path.join(DATA_DIR, f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info(f"Rapport généré et sauvegardé dans {report_file}")
            logger.info(f"Résumé: {report}")
    except Exception as e:
        logger.error(f"Erreur lors de la génération du rapport: {e}")
        logger.error(traceback.format_exc())

def main():
    """Fonction principale exécutée en boucle"""
    logger.info("Démarrage du script demo-runner...")
    logger.info(f"Utilisation du répertoire de données: {DATA_DIR}")
    logger.info(f"Clé API configurée: {API_KEY[:3]}...{API_KEY[-3:] if len(API_KEY) > 6 else ''}")

    try:
        # Collecter les données
        data = collect_fake_data()
        
        # Sauvegarder les données
        if save_data(data):
            # Générer un rapport si les données ont été sauvegardées
            generate_report()
        
        logger.info("Exécution terminée avec succès")
    except Exception as e:
        logger.error(f"Erreur lors de l'exécution: {e}")
        logger.error(traceback.format_exc())

if __name__ == "__main__":
    main()
