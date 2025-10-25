#!/bin/bash
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
DATE=`date +"%Y%m%d_%H%M%S"`
echo "Backing up MongoDB..."
mongodump --out "$BACKUP_DIR/mongo_backup_$DATE"
echo "Backup completed: $BACKUP_DIR/mongo_backup_$DATE"
