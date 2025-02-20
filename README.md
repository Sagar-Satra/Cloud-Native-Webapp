# WebApp
 - Description: The following project is a Node.js-based web application built using Express.js that performs Health Check API.

## Pre-requisites:
1. Download and install node from official website.
2. Download and install MySQL and MySQL workbench.
3. Download and install latest Git version.
4. Download and install Postman to test the API endpoints.
5. Download and install VScode or similar code editors.


## Build and Deploy Instructions
1. Clone the Git repository: 
   using: git clone git@github.com:CSYE6225-Spring2025-SagarSatra/webapp.git

2. Navigate to that cloned directory in the local folder.
   using: cd repository-directory

3. Install the node packages
   using: npn install

4. Create an .env file and mention the variables for local MySQL database:
   DB_NAME= (set as per each local machine)
    DB_USERNAME= (set as per each local machine)
    DB_PASSWORD= (set as per each local machine)
    PORT=(set as per each local machine)

5. Run the application server
   using: node index.js

6. Use REST client or CURL, test the API endpoints
   using: 
        a. curl -vvvv -X GET http://localhost:{local port running}/healthz
        b. curl -vvvv -X PUT http://localhost:8080/healthz
        c. curl -vvvv -X POST http://localhost:8080/healthz
        d. curl -vvvv -X DELETE http://localhost:8080/healthz
        e. curl -vvvv -X PATCH http://localhost:8080/healthz



7. Run below command to implement API testing
   npm test

8.  Setup for running the script
   - Download the zip from canvas and place it into a folder and open the cmd and navigate into that directory
   - Deploy the droplet and copy the IP address
   - Establish the connection using SSH command: ssh -i C:\Users\sagar\.ssh\do root@IPADDRESS
   - scp the zip file into the  "/tmp/ directory" using command : scp -i C:\Users\sagar\.ssh\do webapp.zip root@137.184.63.120:/tmp/
   - copy the .env and shellscript file into the same folder
   - scp -i C:\Users\sagar\.ssh\do setupapp.sh root@137.184.63.120:/tmp/
   - scp -i C:\Users\sagar\.ssh\do .env root@137.184.63.120:/tmp/
   - Unzip the application file into the /tmp/ directory using command: sudo unzip -o /tmp/webapp.zip -d /tmp/
   - chmod +x setupapp.sh
   - ./setupapp.sh
   - Move the .env into the web app - sudo mv /tmp/.env /opt/csye6225/webapp/
   - cd /opt/csye6225/webapp
   - Start the application: node index.js
  
- 9.  If permission denied:
      - mysql -u root -p;
      - SELECT user, host, authentication_string FROM mysql.user;
      - DROP USER IF EXISTS 'sagar'@'localhost';
      - CREATE USER 'sagar'@'localhost' IDENTIFIED BY 'sagar123';
      - GRANT ALL PRIVILEGES ON cloud_native.* TO 'sagar'@'localhost';
      - FLUSH PRIVILEGES;
    - or 
    - ALTER USER 'sagar'@'localhost' IDENTIFIED BY 'newpassword';
  - Might have to kill the SQL server
  - sudo lsof -i :8080
  - sudo kill -9 (1234) change the number
  - then node index.js
