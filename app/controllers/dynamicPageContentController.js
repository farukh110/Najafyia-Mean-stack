var DynamicPageContent = require("../models/dynamicPageContent.js");
var ObjectID = require("mongodb").ObjectID;

//add and update page content
module.exports.savePageContent = function (req, res) {
  if (req.body._id) {
    DynamicPageContent.findById(req.body._id, (err, pageContent) => {
      if (pageContent) {
        pageContent.title = req.body.title || pageContent.title;
        pageContent.titleImage = req.body.titleImage || pageContent.titleImage;
        pageContent.slug = req.body.slug && req.body.slug.toLowerCase().split(" ").join("-") || pageContent.slug;
        pageContent.description =
          req.body.description || pageContent.description;
        pageContent.order = pageContent.order;
        pageContent.pageContent =
          req.body.pageContent || pageContent.pageContent;
        pageContent.parentPageName =
          req.body.parentPageName || pageContent.parentPageName;
        pageContent.subParentPageId =
          req.body.subParentPageId || pageContent.subParentPageId;
        pageContent.gallery = req.body.gallery || pageContent.gallery;
        pageContent.language = req.body.language || pageContent.language;
        pageContent.updated = Date.now();
        pageContent.save((err, user) => {
          if (err) {
            res.status(500).send(err);
          }
          res.json("page content updated Successfully!");
        });
      } else {
        return res.status(404).send({
          message: "page not found!"
        });
      }
    });
  } else {
    DynamicPageContent.findById(req.body._id, (err, pageContent) => {
      if (pageContent) {
        return res.status(409).send({
          message: "page name already exist!"
        });
      } else {
        var pageContent = new DynamicPageContent({
          title: req.body.title,
          titleImage: req.body.titleImage || null,
          description: req.body.description || null,
          pageContent: req.body.pageContent || null,
          parentPageName: req.body.parentPageName || null,
          subParentPageId: req.body.subParentPageId || null,
          gallery: req.body.gallery || null,
          language: req.body.language || "ENG",
          isActive: true
        });
        pageContent.save(function (error) {
          if (error) {
            res.status(500).send(error.message);
          } else {
            res.json("page content saved Successfully!");
          }
        });
      }
    });
  }
};

// delete page
module.exports.deletePage = function (req, res) {
  try {
    DynamicPageContent.findByIdAndRemove(req.params.Id, function (
      err,
      pageContent
    ) {
      let response = {
        message: "page deleted Successfully!",
        id: pageContent._id
      };
      res.status(200).send(response);
    });
  } catch (ex) {
    res.send(ex);
  }
};

// get page content
module.exports.getPageContentByTitle = function (req, res) {
  DynamicPageContent.findOne({ title: req.params.title }, function (
    err,
    pageContent
  ) {
    res.status(200).send(pageContent);
  });
};

// get pageContent by id

module.exports.getPageContentById = function (req, res) {
  let query = { language: req.headers.language };
  if (req.params.Id && (req.params.Id.length !== 24 || req.params.Id.indexOf("-") >= 0)) {
    query.slug = req.params.Id;
  } else {
    query._id = req.params.Id;
  }
  DynamicPageContent.findOne(query)
    .populate("subParentPageId")
    .exec(function (err, pageContent) {
      res.status(200).send(pageContent);
    });
};

// get pages list by name
module.exports.getPagesListByName = function (req, res) {
  DynamicPageContent.find(
    {
      parentPageName: req.params.title,
      subParentPageId: null,
      language: req.headers.language
    },
    function (err, pageContent) {
      res.status(200).send(pageContent);
    }
  );
};

// get pages list by id
module.exports.getPagesListById = function (req, res) {
  let query = {
    language: req.headers.language
  };
  const id = req.params.Id;
  if (id && id.length == 24 && id.indexOf('-') >= 0) {
    query.subParentPageId = req.params.Id;
    DynamicPageContent.find(query,
      function (err, pageContent) {
        res.status(200).send(pageContent);
      }
    );
  } else {
    query.slug = req.params.Id;
    DynamicPageContent.findOne(query, { _id: 1 },
      function (err, doc) {
        delete query.slug;
        if (doc) {
          query.subParentPageId = doc.id;
          DynamicPageContent.find(query, function (dErr, pages) {
            res.status(200).send(pages);
          })
        } else {
          res.status(200).send([]);
        }
      }
    );
  }
};
// get pages list by id
module.exports.getPageIdByName = function (req, res) {
  DynamicPageContent.findOne(
    {
      title: {
        $regex: `.*${req.params.name}.*`,
        $options: "i"
      },
      language: req.params.lang
    },
    { _id: 1 },
    function (err, pageContent) {
      if (pageContent) {
        res.status(200).send(pageContent._id);
      } else {
        res.status(400).send({message: "No Page Found"});
      }
    }
  );
};

//get all pages list
module.exports.getAllPagesList = function (req, res) {
  DynamicPageContent.find({ language: req.query.language }, function (
    err,
    pageContent
  ) {
    res.status(200).send(pageContent);
  });
};
