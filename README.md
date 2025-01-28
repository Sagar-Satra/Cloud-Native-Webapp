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
