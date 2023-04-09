# nf-release

**This ReadMe file describes a few details about the repository and provides the steps to configure the codebase and successfully run it in a local enviorment.**

## Repository

* This repository contains the codebase for najafiya.org
* It is currently the only project running live as of Feburary 2020
* The Project has been built using **MEAN STACK**
  * Angular.js as (Frontend)
  * Node.js v8.9.4 as (Backend)
  * MongoDb as (NoSql Database)
  * Dockerized Deployment under process 
  


## Setup Guide 

#### The following steps will guide you towards a succeful installation setup on local enviorment for development

* [Install git](https://git-scm.com/downloads) 
  * Ignore if already installed 
* [Install nvm : Node Version Manager](https://github.com/coreybutler/nvm-windows)
  * Ignore if already installed
* [Install Docker](https://docs.docker.com/docker-for-windows/install/)
  * Check your windows version and select the appropriate installer from the link.
* Install project(code) on your system
  1. open cmd , and switch to directory where you want the code to be stored locally.
  2. run command ` git clone https://github.com/Talverse/nf-release.git `
  3. once cloning complete , checkout a new branch from **origin/develop** , you may use the following commands 
  ```
  // creating local branch named develop mapping develop branch from origin
  git checkout -b develop origin/develop   
  // pulling latest code from origin 
  git pull origin develop  
  ```
  4. open code in VSCode and run command  ` nvm list `
      * This lists the installed versions of node
      * Choose node version 8.9.4 , Download the version if not installed by running the command `npm install -g node@version. Example: npm install -g node@8.9.4 `
      * If you already have version 8.9.4 downloaded , you can easily use command ` nvm use 8.9.4 ` to chnage enviorment version to **Node 8.9.4**
  5. After changing node version , we can succefully install the dependecies by runnung command ` npm i  #(This installs the packages from package.json ` 
  6. **Running the App**
    * Once all the packages are installed , you can run command `docker-compose up --build` to build the docker image and ready the database server
    * run the following command in a diffferent terminal
      1. `npm start` or 
      2. `npm run start:dev`  ( for hot reloading ) 
    * Browse the website with by typing **http://localhost/** in the browser 
  7. **Restoring Database** 
     * If you havent configured the Database already , the following steps will completely guide you
       * You can download a MongoDB Client such as [Robot 3T](https://robomongo.org/)
       * You can connect the MongoDB running in container on **port : 27018** with the MongoDB client 
       * Download Database Backup and tools from MSTeams 
         1. Teams > Najafyia > Files > Database backups > mongodb-database-tools-windows-x86_64-100.3.0.rar
         2. Teams > Najafyia > Files > Database backups > najafyia_qa_16Feb2021_530PM.rar (or whatever latest backup file available)
       * once download completes , extract both folders
         * copy the folder insde 'najafyia_qa_16Feb2021_530PM.rar' named as 'najafyia_qa' and paste it into ' mongodb-database-tools-windows-x86_64-100.3.0 > mongodb-database-tools-windows-x86_64-100.3.0 > bin > dump'
         * Run the command for restoring databse ` mongorestore  dump/ --uri="mongodb://localhost:27018/najafyia_qa" `
      
## How to prepare a new build 

#### 1. Najafyia.org - Frontend JS/CSS files bundling

* Use build-utility project to bundle JS/CSS files for najafyia.org (use Node version >= 12)
* Go to folder "build-utlity" & Run `npm install` then `npm run build:frontend`
# Add qa for QA build in package.json against the key build:frontend. (Example: "build:frontend": "node ./index.js qa") #
# Add prod for PRODUCTION build in package.json against the key build:frontend. (Example: "build:frontend": "node ./index.js prod") #
* This will create new folder named as "build" and required files in it
* Copy and paste (overwrite) all files into "public" folder of LIVE/QA environment


#### 2. Najafyia.org - Cron-Jobs Building 


* Use build-utility project to create a build for najafyia.org Cron-Jobs such as **Thursday Ziyarat Scheduler**  (use Node version >= 12)
* Go to folder "build-utlity" & Run `npm install` then `npm run build:jobs`
* This will create new folder named as "buildJobs" and required files in it
 * once the "buildJobs" folder is ready , you can take it anywhere as a seperate directory
 * open the folder in cmd and make sure you are using Node version **8.9.4**
   *  Run the command `npm install` to install necessarry packages 
   *  Then start the service with either of the commands 
   *   ` npm start ` or  ` node server.js `   -- For Production
   *   ` npm run start:dev ` or  ` nodemon  server.js ` -- For Development 






