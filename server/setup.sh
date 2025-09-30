#!/bin/bash

echo "Setting up Tempo Dashboard Server..."
echo

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo
    echo "IMPORTANT: Edit .env file with your configuration:"
    echo "- Database password"
    echo "- Admin credentials"
    echo "- JWT secret"
    echo
    read -p "Press enter to continue..."
fi

# Install dependencies
echo "Installing dependencies..."
npm install
echo

echo "Setup complete!"
echo
echo "Next steps:"
echo "1. Make sure MariaDB is installed and running"
echo "2. Edit .env with your configuration"
echo "3. Run: npm start (database will be created automatically)"
echo

read -p "Press enter to exit..."