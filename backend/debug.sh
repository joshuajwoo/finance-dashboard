#!/bin/sh

echo "--- STARTING NETWORK DEBUG SCRIPT ---"

echo "--- PRINTING ALL ENVIRONMENT VARIABLES ---"
printenv

# Extract the hostname from the DATABASE_URL to test it
DB_HOST=$(echo $DATABASE_URL | awk -F'[@:]' '{print $4}')

if [ -z "$DB_HOST" ]; then
    echo "ERROR: Could not parse DB_HOST from DATABASE_URL. Please verify the URL format."
else
    echo "--- PINGING DATABASE HOST: $DB_HOST ---"
    ping -c 4 $DB_HOST

    echo "--- TESTING PORT 5432 CONNECTION WITH NETCAT (nc) ---"
    # The -z flag tells nc to scan for listening daemons without sending data
    # The -v flag gives verbose output
    nc -z -v $DB_HOST 5432
fi

echo "--- DEBUG SCRIPT FINISHED. CONTAINER WILL NOW SLEEP. ---"
# Sleep to keep the container running so App Runner doesn't kill it
sleep 3600