const pkg = require('node-html-parser');
const { parse } = pkg;
const fs = require('fs');
// const uglify = require("uglify-js");
const axios = require('axios');
const minify = require('minify');
const tryToCatch = require('try-to-catch');
const dotenv = require('dotenv');
let root;
const buildPath = 'build/';
const sourcePath = '../public/';
const mainCSSFileName = 'main.min.css';
const mainJSHeadFileName = 'main-head-min.js';
const mainJSBodyFileName = 'main-body-min.js';
const fontawesomeFontsFolder = sourcePath + 'libs/font-awesome/fonts/';
const fontglyphiconsFontsFolder = sourcePath + 'assets/css/';
startBundling();

async function getContentByUrl(url) {
    let response = await axios.get(url)
    // console.log(response.data);
    return response.data;
}
function isInclude(element, filePath) {
    var toBeInc = false;
    if (!filePath)
        return toBeInc;
    return true;
    var includeJS = ['directives', 'controller', 'service', 'froala-editor', 'tableExport', 'html2canvas.js', 'jspdf.debug.js', 'jspdf.plugin.autotable.js', 'social-share-kit.js', 'noty.js']
    if (element.parentNode.rawTagName == "body") {
        for (let i = 0; i < includeJS.length; i++) {
            if (filePath.indexOf(includeJS[i]) > -1) {
                toBeInc = true;
                break;
            }
        }
    }
    else
        toBeInc = true;
    return toBeInc;
}
function mergeJSFiles() {
    let buildType = process.argv[2];
    //console.log("buildType: " + buildType)

    if (buildType == "prod") {
        dotenv.config({ path: './environment-files/environment-prod.env' });
    }
    else {
        dotenv.config({ path: './environment-files/environment-qa.env' });       //If not prod then by default QA build
    }

    let newKey = process.env.PAYMENT_STRIPE_PUBLIC_KEY

    console.log("******************JS Bundling************")
    var scripts = root.querySelectorAll('script');

    var mainFilePath = buildPath;
    let counter = 1;
    scripts.forEach((element, index) => {
        var filePath = element.getAttribute('src');
        if (isInclude(element, filePath)) {
            mainFilePath = buildPath;
            if (element.parentNode.rawTagName == "body") {
                mainFilePath += mainJSBodyFileName;
            }
            else {
                mainFilePath += mainJSHeadFileName;
            }
            if (!filePath.startsWith("http")) {
                if (!filePath.startsWith("/"))
                    filePath = "/" + filePath;
                filePath = filePath.split('?')[0]
                console.log(counter, "- Merging JS file", filePath);
                var strContent = fs.readFileSync(`${sourcePath + filePath}`, "utf-8").trim();

                if (filePath.indexOf("app.js") >= 0) {

                    let indexOfPublishKey = strContent.indexOf("PublishKey");
                    let indexOfFirstDoubleQouteAfterPublishKey = strContent.indexOf("\"", indexOfPublishKey + 1);
                    let indexOfSecondDoubleQouteAfterPublishKey = strContent.indexOf("\"", indexOfFirstDoubleQouteAfterPublishKey + 1);

                    let keyToReplace = strContent.substring(indexOfFirstDoubleQouteAfterPublishKey + 1, indexOfSecondDoubleQouteAfterPublishKey)

                    // console.log(indexOfPublishKey)
                    // console.log(indexOfFirstDoubleQouteAfterPublishKey)
                    // console.log(indexOfSecondDoubleQouteAfterPublishKey)
                    // console.log(keyToReplace)

                    strContent = strContent.replace(keyToReplace, newKey);

                    //console.log(strContent)
                }
                strContent = (strContent.endsWith(")") ? strContent + ";" : strContent) + "\n";
                // fs.writeFileSync(`css-mini/css/public/js/${index + path.basename(filePath)}`, strContent);
                fs.appendFileSync(mainFilePath, strContent);
                element.remove();
                counter++;
            }
            else {
                console.log("Ignoring file", filePath)
            }
        }
    });
}

function getTodaysDate() {

    console.log("getTodaysDate")
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let currentDateinNumberFormat = year + month + date

    return currentDateinNumberFormat;

}

async function startBundling() {
    try {

        let currentDateinNumberFormat = getTodaysDate();
        let buildType = process.argv[2];


        // clean build folder
        if (fs.existsSync(buildPath)) {
            fs.rmSync(buildPath, { recursive: true });
        }
        fs.mkdirSync(buildPath);//create build folder
        var indexHTML = fs.readFileSync(`${sourcePath}index.html`, "utf-8");
        indexHTML = await replaceGTMSourceCode(indexHTML,buildType);
        root = parse(indexHTML);
        await mergeJSFiles();
        await mergeCSSLinks();
        let newIndexHTML = root.toString();
        

        newIndexHTML = newIndexHTML.replace('<head>', `<head><link rel='stylesheet' href='${mainCSSFileName}?v=${currentDateinNumberFormat}' type='text/css' media='all' >`);
        newIndexHTML = newIndexHTML.replace('</head>', `<script src="${mainJSHeadFileName}?v=${currentDateinNumberFormat}" type="text/javascript"></script></head>`);
        newIndexHTML = newIndexHTML.replace('</body>', `<script src="${mainJSBodyFileName}?v=${currentDateinNumberFormat}" type="text/javascript"></script></body>`);

        fs.writeFileSync(`${buildPath}index.html`, newIndexHTML);
        //await minifyBundleFiles(); -- need to check issue being faced after minification

        
        //copy font files
        copyFontFiles();
        // console.log('App bundling completed!');
    }
    catch (err) {
        console.log(err)
    }
}
function copyFontFiles() {
    fs.copyFileSync(`${fontawesomeFontsFolder}fontawesome-webfont.woff`, `${buildPath}fontawesome-webfont.woff`);
    fs.copyFileSync(`${fontawesomeFontsFolder}fontawesome-webfont.woff2`, `${buildPath}fontawesome-webfont.woff2`);
    fs.copyFileSync(`${fontawesomeFontsFolder}fontawesome-webfont.eot`, `${buildPath}fontawesome-webfont.eot`);
    fs.copyFileSync(`${fontawesomeFontsFolder}fontawesome-webfont.ttf`, `${buildPath}fontawesome-webfont.ttf`);
    fs.copyFileSync(`${fontawesomeFontsFolder}fontawesome-webfont.svg`, `${buildPath}fontawesome-webfont.svg`);
    fs.copyFileSync(`${fontglyphiconsFontsFolder}glyphicons-halflings-regular.woff`, `${buildPath}glyphicons-halflings-regular.woff`);
    fs.copyFileSync(`${fontglyphiconsFontsFolder}glyphicons-halflings-regular.woff2`, `${buildPath}glyphicons-halflings-regular.woff2`);

}
async function mergeCSSLinks() {
    //console.log("******************CSS Bundling************")
    var links = root.querySelectorAll('link');
    var cssMain = buildPath + mainCSSFileName;
    let counter = 1;
    for (let i = 0; i < links.length; i++) {
        try {
            var element = links[i];
            var filePath = element.getAttribute('href');
            // console.log(i, filePath);
            if (filePath && filePath.indexOf('css') > -1) {
                if (!filePath.startsWith("http")) {
                    if (!filePath.startsWith("/"))
                        filePath = "/" + filePath;
                    filePath = filePath.split('?')[0]
                    if (fs.existsSync(`${sourcePath + filePath}`)) {
                        console.log(counter, "- Merging CSS file - ", filePath);
                        var strContent = fs.readFileSync(`${sourcePath + filePath}`, "utf-8");
                        //   fs.writeFileSync(`css-mini/css/public/css/${path.basename(filePath)}`, strContent);
                        fs.appendFileSync(cssMain, strContent);
                        element.remove();
                    }
                    else {
                        console.log("Error: File not found", filePath)
                    }
                }
                else {
                    // console.log(counter, "- Merging CSS file by downloading - ", filePath);
                    let data = await getContentByUrl(filePath);
                    fs.appendFileSync(cssMain, data);
                    element.remove();
                }
                counter++;
            }
        }
        catch (err) {
            //console.log(err);
        }
    }
}

async function minifyBundleFiles() {
    const options = {
        html: {
            removeAttributeQuotes: false,
            removeOptionalTags: false,
        },
    };
    let filesToMinify = [`${buildPath + mainCSSFileName}`, `${buildPath + mainJSHeadFileName}`, `${buildPath + mainJSBodyFileName}`];

    await filesToMinify.map(async function (filePath) {
        console.log("Minifying...", filePath)
        const [error, data] = await tryToCatch(minify, filePath, options);

        if (error)
            return console.error(error.message);
        if (data) {
            fs.writeFileSync(filePath, data);
        }
    });
}

async function replaceGTMSourceCode(indexHTML,buildType){
    
    let gtmScript = "<script>(function (w, d, s, l, i) {w[l] = w[l] || []; w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'}); var f = d.getElementsByTagName(s)[0],j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src ='https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);})(window, document, 'script', 'dataLayer', 'GTM-TCB95R4');</script>";
    let gtmNonScript = '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TCB95R4" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>';

        if (buildType == "prod"){
            indexHTML = indexHTML.replace("<!--GoogleTagManagerCode-->", gtmScript);
            indexHTML = indexHTML.replace("<!--GoogleTagManager(noscript)ToReplace-->", gtmNonScript);
        }
    return indexHTML;
}