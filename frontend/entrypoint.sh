#!/binsh
set -e

echo "--- DNS DIAGNOSTIC ---"
echo "Attempting to resolve backend.local..."

# Try to get the IP address for backend.local
getent hosts backend.local

echo "DNS lookup complete."
echo "----------------------"

# Now, continue to start the Nginx server
exec nginx -g 'daemon off;'