const path = require('path');
const { Seeder } = require('mongo-seeding');
var config = require('../config/development');

startImport();
async function startImport() {
  try {
    const dbConfiguration = {
      database: config.dbUrl,
      dropDatabase: false,
      dropCollections: false
    };
    const seeder = new Seeder(dbConfiguration);
    const collectionReadingOptions = {
      extensions: ['json'],
      ejsonParseOptions: {
        relaxed: false,
      },
      transformers: [
        Seeder.Transformers.replaceDocumentIdWithUnderscoreId,
        Seeder.Transformers.setCreatedAtTimestamp,
        Seeder.Transformers.setUpdatedAtTimestamp,
      ]
    };
    const collections = seeder.readCollectionsFromPath(
      path.resolve('./data-migration/data'),
      collectionReadingOptions,
    );
    for (var i = 0; i < collections.length; i++) {
      let col;
      try {
        col = collections[i];
        console.log(`********** Starting import for ${col.name} *************`);
        const response = await seeder.import([col]);
        console.log(`********** Completed import for ${col.name} *************`, response);
      }
      catch (err) {
        console.log(`********** Failed import for ${col.name} *************`, err);
      }
    }
  }
  catch (err) {
    console.log('Error in import', err);
  }
}
