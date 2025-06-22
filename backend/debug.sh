#!/bin/sh

echo "--- STARTING NETWORK DEBUG SCRIPT ---"

echo "--- PRINTING ALL ENVIRONMENT VARIABLES ---"
printenv

# Extract the hostname from the DATABASE_URL to test it
DB_HOST=$(echo $DATABASE_URL | awk -F'[@:]' '{print $4}')

if [ -z "$DB_HOST" ]; then
    echo "ERROR: Could not parse DB_HOST from DATABASE_URL. Please verify the URL format in AWS Console."
else
    echo "--- 1. PINGING DATABASE HOST: $DB_HOST ---"
    ping -c 4 $DB_HOST

    echo "--- 2. TESTING PORT 5432 CONNECTION WITH NETCAT (nc) ---"
    nc -z -v $DB_HOST 5432
fi

echo "--- DEBUG SCRIPT FINISHED. CONTAINER WILL NOW SLEEP. ---"
sleep 3600