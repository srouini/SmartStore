#!/bin/bash
set -e

# Create a settings override file
cat > /app/smartstore/settings_override.py << EOF
from smartstore.settings import *

# Override ALLOWED_HOSTS to include all possible combinations
ALLOWED_HOSTS = ['*']  # This allows all hosts in development, adjust for production

# Apply any other runtime settings overrides here
EOF

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Start the server with the overridden settings
exec gunicorn --bind 0.0.0.0:8000 smartstore.wsgi:application
