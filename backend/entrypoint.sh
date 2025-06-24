#!/bin/sh
set -e

echo "--- APP RUNNER DIAGNOSTIC TEST ---"
echo "This script is testing if logs are being captured."
echo "Date: $(date)"
echo "--------------------------------"
echo "PRINTING ALL ENVIRONMENT VARIABLES:"

printenv

echo "--- DIAGNOSTIC SCRIPT FINISHED ---"