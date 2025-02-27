#!/bin/bash

echo "Starting system setup..."

# Update & upgrade system
echo "Updating system packages..."
sudo apt-get update -y

sudo apt-get upgrade -y

# Install MySQL
echo "Installing MySQL and other packages service..."
sudo apt-get install -y mysql-server unzip pkg-config libmysqlclient-dev

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

echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Create a Linux user for the application
echo "Creating non-login Linux user..."
sudo groupadd csye6225
sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225

# Setup application directory
echo "Setting up application directory..."
sudo mkdir -p /opt/csye6225
sudo chown -R csye6225:csye6225 /opt/csye6225
sudo chmod 755 /opt/myapp


# Change to app directory and install dependencies
cd /opt/csye6225/webapp || exit
echo "Installing application dependencies..."
sudo -u csye6225 npm install