#!/bin/sh
echo "Configuring database"

set -o allexport
. ./.env
set +o allexport

cat db.sql | mysql --user=$DB_USER --password=$DB_PASS --host=$DB_HOST $DB_NAME