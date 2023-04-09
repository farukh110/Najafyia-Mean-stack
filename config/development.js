const { database } = require('./configuration');

module.exports = {    
    dbUrl:    database.mongoUrl,     
    dbConfig: {
        db: { native_parser: database.nativeParser },
        server: { poolSize: database.poolSize }        
    }
}