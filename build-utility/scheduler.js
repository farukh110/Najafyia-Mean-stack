
const fs = require('fs');
// const uglify = require("uglify-js");
const buildPath = 'buildJobs/';
const sourcePathApp = '../app/';
const sourcePathConf = '../config/';
const sourcePathPublicJs = '../public/js/';



const fse = require('fs-extra');
const destDir = `buildJobs/`;
                              

startPackaging();

function startPackaging() {

    // try 

    if (fs.existsSync(buildPath)){
        fs.rmSync(buildPath, { recursive: true });}

    fs.mkdirSync(buildPath);//create build folder


    if (fs.existsSync(buildPath+'config/')){
        fs.rmSync(buildPath+'config/', { recursive: true });}

    fs.mkdirSync(buildPath+'config/');

    

    if (fs.existsSync(buildPath+'app/')){
        fs.rmSync(buildPath+'app/', { recursive: true });}

    fs.mkdirSync(buildPath+'app/')

    if (fs.existsSync(buildPath+'public/')){
        fs.rmSync(buildPath+'public/', { recursive: true });}

    fs.mkdirSync(buildPath+'public/');

    if (fs.existsSync(buildPath+'public/js/')){
        fs.rmSync(buildPath+'public/js/', { recursive: true });}

    fs.mkdirSync(buildPath+'public/js/');


    fse.copySync(sourcePathApp, destDir+'app/');
    fs.copyFileSync(`${sourcePathConf}configuration.js`, `${destDir}config/configuration.js`);
    fs.copyFileSync(`${sourcePathConf}development.js`, `${destDir}config/development.js`);
    fs.copyFileSync(`${sourcePathPublicJs}emailTemplates.js`, `${destDir}public/js/emailTemplates.js`);
    fs.copyFileSync(`${sourcePathPublicJs}emailTransporter.js`, `${destDir}public/js/emailTransporter.js`);

    fs.copyFileSync(`../package.json`, `${destDir}package.json`);

    const buildAssetsServerJs = '../build-utility/build-assets/jobs/';
    fs.copyFileSync(`${buildAssetsServerJs}server.js`, `${destDir}server.js`);

    fs.rmdirSync(buildPath+'app/controllers/', { recursive: true });
    fs.rmdirSync(buildPath+'app/emails/', { recursive: true });
    fs.rmdirSync(buildPath+'app/passport/', { recursive: true });
    fs.unlinkSync(buildPath+'app/routes.js');



}

