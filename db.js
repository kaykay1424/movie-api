const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectID;
const MongoClient = mongodb.MongoClient;

module.exports.myFlixDB = {
    ObjectID,
    connectToDB: function() {
        return new Promise((resolve,reject) => {
            MongoClient.connect(process.env.MONGO_DB_URL, (err, db) => {            
                resolve(db);
                reject(err);
            });
        });    
    },
    deleteRecord: function(collection, record) {
        return new Promise((resolve,reject) => {
            this.connectToDB()
            .then((db) => {
                const dbo = db.db('myFlixDB');
                dbo.collection(collection).remove(record, (err, result) => {
                    resolve(result);
                    reject(err);
                    db.close();
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    },
    findRecord: function(collection, conditions={}) {
        return new Promise((resolve,reject) => {
            this.connectToDB()
            .then((db) => {
                const dbo = db.db('myFlixDB');
                dbo.collection(collection).findOne(conditions, (err, result) => {
                    resolve(result);
                    reject(err);
                    db.close();
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    },
    findRecords: function(collection, conditions={}) {
        return new Promise((resolve,reject) => {
            this.connectToDB()
            .then((db) => {
                const dbo = db.db('myFlixDB');
                dbo.collection(collection).find(conditions).toArray((err, result) => {
                    resolve(result);
                    reject(err);
                    db.close();
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    },
    insertRecord: function(collection, record) {
        return new Promise((resolve,reject) => {
            this.connectToDB()
            .then((db) => {
                const dbo = db.db('myFlixDB');
                dbo.collection(collection).insertOne(record, (err, result) => {
                    resolve(result);
                    reject(err);
                    db.close();
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    },
    updateRecord: function(collection, record, conditions) {
        return new Promise((resolve,reject) => {
            this.connectToDB()
            .then((db) => {
                const dbo = db.db('myFlixDB');
                dbo.collection(collection).updateOne(record, conditions, (err, result) => {
                    resolve(result);
                    reject(err);
                    db.close();
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }
}
