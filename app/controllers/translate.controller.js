const fs = require('fs');

const databaseHelper = require('../utilities/databaseHelper');
const constants = require('../constants');

let obj = {
    table: []
};

module.exports.readJSON = function (req, res) {
    const fileUrl = 'public/js/i18n/' + req.params.language + '.json';
    fs.exists(fileUrl, function (exists) {

        if (exists) {
            fs.readFile(fileUrl, 'utf8', function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    data = JSON.parse(data);
                    res.status(200).send(Object.entries(data));
                }
            });
        } else {
            res.status(400).send({ message: "File not Found" });
        }
    });

}


module.exports.getNoteBasedOnSlug = async function (req,res)
{
    const methodName = "getNoteBasedOnSlug";
    try {
        
       let slug =  req.query.slug ? req.query.slug : '';
       if(slug != '' )
       {
          let messages =  await databaseHelper.getItem( constants.Database.Collections.CONFIG_SETTING.dataKey,{key: 'NoteForEndUser',"value.slug" : slug});
           res.status(200).send(messages);
       }
    }
    catch(ex)
    {
        console.log('caught in carch ',ex);
        logHelper.logError(`${FILE_NAME}: ${methodName}: Error in getting note  `, ex);
        res.status(500).send(ex);;
    }
}