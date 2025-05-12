#!/bin/bash
# Script d'exemple pour effectuer une sauvegarde des données

# Récupérer les variables d'environnement
DATA_DIR="${DATA_DIR:-./data}"
BACKUP_DIR="${DATA_DIR}/backups"
LOG_LEVEL="${LOG_LEVEL:-INFO}"

# Fonctions de logging
log_info() {
    if [[ "$LOG_LEVEL" == "INFO" || "$LOG_LEVEL" == "DEBUG" ]]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - INFO - $1"
    fi
}

log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR - $1"
}

log_debug() {
    if [[ "$LOG_LEVEL" == "DEBUG" ]]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - DEBUG - $1"
    fi
}

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Nom du fichier de sauvegarde avec timestamp
BACKUP_FILE="${BACKUP_DIR}/backup_$(date '+%Y%m%d_%H%M%S').tar.gz"

# Compter le nombre de fichiers de données
DATA_FILES=$(find "$DATA_DIR" -name "data_*.json" | wc -l)
log_info "Nombre de fichiers de données trouvés: $DATA_FILES"

if [ "$DATA_FILES" -eq 0 ]; then
    log_info "Aucun fichier à sauvegarder"
    exit 0
fi

# Effectuer la sauvegarde
log_info "Création de la sauvegarde dans $BACKUP_FILE"
tar -czf "$BACKUP_FILE" -C "$DATA_DIR" $(find "$DATA_DIR" -name "data_*.json" -printf "%P\n")

# Vérifier si la sauvegarde a réussi
if [ $? -eq 0 ]; then
    log_info "Sauvegarde terminée avec succès"
    
    # Nettoyer les anciennes sauvegardes (garder les 5 plus récentes)
    log_info "Nettoyage des anciennes sauvegardes..."
    ls -t "$BACKUP_DIR"/backup_*.tar.gz | tail -n +6 | xargs -r rm
    
    # Créer un fichier de métadonnées
    META_FILE="${BACKUP_DIR}/backup_meta_$(date '+%Y%m%d_%H%M%S').json"
    cat > "$META_FILE" << EOL
{
  "timestamp": "$(date -Iseconds)",
  "backup_file": "$BACKUP_FILE",
  "files_count": $DATA_FILES,
  "backup_size": "$(du -h "$BACKUP_FILE" | cut -f1)"
}
EOL
    log_info "Métadonnées de sauvegarde créées dans $META_FILE"
else
    log_error "Erreur lors de la création de la sauvegarde"
fi

# Lister les sauvegardes disponibles
log_info "Liste des sauvegardes disponibles:"
ls -lh "$BACKUP_DIR"/backup_*.tar.gz | awk '{print $9, $5}'
