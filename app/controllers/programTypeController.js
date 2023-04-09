var ProgramType = require('../models/programType.js');
var ObjectID = require('mongodb').ObjectID;

module.exports.addProgramContent = function(req,res) {
   ProgramType.update({_id:ObjectID(req.body._id)},{
       $set:{
           content: req.body.content,
           updated: Date.now(),
       }
   },(err, ptRes) => {
    if(err){
        res.status(400).send("Error Occur"+ err);
    }else {
     res.status(200).send("Success");
    }
   })
};

//Create Program type
module.exports.addProgramType = function (req, res) {
    var programType = new ProgramType({
        ProgramTypeName: req.body.programTypeName,
        created: Date.now(),
        updated: Date.now(),
        createdBy: 'NA',
        updatedBy: 'NA'
    })
    programType.save(function (error) {
        if (error) {
            throw error;
        }
        else {
            res.json('Program Type created Sucessfully');
        }
    })
}
//Create New Program type
//Create User

// Delete Program type
module.exports.deleteProgramType = function (req, res) {
    try {
        ProgramType.findByIdAndRemove(req.params.Id, function (err, programType) {
            let response = {
                message: "Program Type Deleted Sucessfully",
                id: programType._id
            };
            res.status(200).send(response);
        });
    }
    catch (ex) {
        res.send(ex);
    }
}
// all Program type list
module.exports.ProgramTypeList = function (req, res) {
    ProgramType.find({
        language: req.params.userLang

    }, 
    function (err, programTypes) {

        if (err != undefined) {
            res.send(err);
        }
        res.status(200).send(programTypes);
    });
}
// update program type
module.exports.updateProgramType = function (req, res) {
    ProgramType.findById(req.body.id, (err, programType) => {
        if (err) {
            res.status(500).send(err);
        }
        else {
            programType.ProgramTypeName = req.body.ProgramTypeName || programType.ProgramTypeName;
            programType.updated = Date.now();
            programType.updatedBy = 'NA';
            programType.save((err, programType) => {
                if (err) {
                    res.status(500).send(err)
                }
                res.json('Program updated Sucessfully');
            });
        }
    });
}
// //select program type by id
module.exports.ProgramTypeByName = function (req, res) {


    ProgramType.find({
        programTypeName: req.params.name,
        language: req.params.userLang
    }, function (err, programType) {
        res.status(200).send(programType);
    });
}



