#!/bin/bash

echo "Starting system setup..."

# Update & upgrade system
echo "Updating system packages..."
# sudo apt update 
apt-get update
# sudo apt upgrade
apt-get upgrade -y

# Install MySQL
echo "Installing MySQL and other packages service..."
sudo apt install -y mysql-server unzip pkg-config libmysqlclient-dev

# Start & enable MySQL
echo "Starting MySQL service..."
sudo systemctl enable mysql
sudo systemctl start mysql

# Configure MySQL database and user
echo "Configuring MySQL database..."
sudo mysql -u root -e "
CREATE DATABASE IF NOT EXISTS cloud_native;
CREATE USER 'sagar'@'localhost' IDENTIFIED BY 'sagar123';
GRANT ALL PRIVILEGES ON *.* TO 'sagar'@'localhost';
FLUSH PRIVILEGES;
"
echo "MySQL Database configured"

# Making the directory for application
echo "Deploying application..."
sudo mkdir -p /opt/csye6225
echo "Directory created"

# Unzipping the application
echo "Unzipping the application files into the directory"
sudo unzip -o /tmp/webapp.zip -d /opt/csye6225/
echo "Unzipping finished"

# Create Linux group & user
echo "Creating Linux group & user..."
sudo groupadd -f csye6225
id -u csye6225_app &>/dev/null || sudo useradd -m -g csye6225 -s /bin/bash csye6225_app

# Set permissions
echo "Setting permissions..."
sudo chown -R csye6225_app:csye6225 "/opt/csye6225"
sudo chmod -R 750 "/opt/csye6225"
echo "Permissions set done."


# Go to the directory where the web application is installed.
cd /opt/csye6225/webapp || exit
echo "Directory changed"

# Install Node.js if missing
if ! command -v node &>/dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "Node has been installed."

# Install dependencies
if [ -f "/opt/csye6225/webapp/package.json" ]; then
    sudo -u csye6225_app npm install
else
    echo "Error: package.json not found in /opt/csye6225/webapp."
    exit 1
fi
echo "Package.json dependencies have been installed."

# Start the Node.js server in the background
echo "Starting Node.js server..."
echo "Application started successfully."