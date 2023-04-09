var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});

var upload = multer({ storage: storage }).array('userPhoto', 5000);


module.exports.uploadPhotos = function (req, res, next) {
  upload(req, res, function (err) {
    //console.log(req.body);
    //console.log(req.files);
    console.log('storage location is ', req.hostname + '/' + req.body[0].path);

    const files = req.body

    if (!files || err) {
      const error = err || new Error('Please choose files')
      error.httpStatusCode = 400
      return next(error)
    }
    res.send(files);
  });
};