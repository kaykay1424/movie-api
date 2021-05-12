/********** Custom Error Classes ***********/

class NotAuthorizedError extends Error {
    constructor(message) {
        // Pass remaining arguments 
        // (including vendor specific ones) to parent constructor
        super(message);
  
        // Maintains proper stack trace for where our error was thrown
        // (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotAuthorizedError);
        }

        this.name = 'NotAuthorizedError';
        this.status = 401;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        // Pass remaining arguments 
        // (including vendor specific ones) to parent constructor
        super(message);
  
        // Maintains proper stack trace for where our error was thrown
        // (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotFoundError);
        }

        this.name = 'NotFoundError';
        this.status = 404;
    }
}

class MiscellaneousError extends Error {
    constructor(message) {
        // Pass remaining arguments 
        // (including vendor specific ones) to parent constructor
        super(message);
  
        // Maintains proper stack trace for where our error was thrown
        // (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MiscellaneousError);
        }

        this.name = 'MiscellaneousError';
        this.status = 400;
    }
}

const notAuthorizedMessage = 'You cannot edit this user\'s info';
const notFoundMessage = 'No results found';

/********* Functions  ********/

/********* -List functions ********/

const getList = (req, Model, filter={}, select={}, populate={}) => {        
    return new Promise((resolve,reject) => {
        // Make sure user id used belongs to the user that is logged in
        if (filter._id !== String(req.user._id))
            throw new NotAuthorizedError(notAuthorizedMessage); 
    
        Model.findOne(filter, select).populate(populate).exec((err, list) => { 
            if (err) reject(err);
            list = list[populate];
            resolve(list);
        });
    });    
};

const editList = (req, list, item_id, action, Model) => {
    return new Promise((resolve,reject) => {
        // Make sure path params and body params match
        if (req.body[item_id] !== req.params[item_id])
            reject(
                new MiscellaneousError(
                    'Request body and path parameters must match.')
            );  
    
        const filter = {_id: req.params.id},
            listID = req.body[item_id];

        // Make sure user id used belongs to the user that is logged in
        if (filter._id !== String(req.user._id)) 
            reject(new NotAuthorizedError(notAuthorizedMessage)); 
        
        // Find user
        Model.findOne(filter)
        .then(existingUser => { // eslint-disable-line indent
                const updateCondition = {};
                let updateMessage = ``;
            
                if (action == 'add') {
                // Check if item is already in user's list
                    if (existingUser[list].indexOf(listID) > -1) 
                        reject(
                            new MiscellaneousError(
                                `That item is already in your ${list} list. 
                            Try adding another one.`
                            ));
            
                    updateCondition['$push'] = {};
                    updateCondition['$push'][list] = listID;
                    updateMessage = `Item with ID ${listID} has been added
                to your ${list} list.`;
                } else if (action === 'remove') {
                // Check if movie exists in user's movie list
                    if (existingUser[list].indexOf(listID) < 0)
                        reject(
                            new MiscellaneousError(
                                `That movie is not in your ${list} list. 
                            Try removing another one.`
                            )); 

                    updateCondition['$pull'] = {};
                    updateCondition['$pull'][list] = listID;
                    updateMessage = `Item with ID ${listID} has been removed 
                from your ${list} list.`; 
                }

                Model.findOneAndUpdate(filter, updateCondition).then(() => {
                    resolve(updateMessage);
                }).catch((err) => {
                    reject(err);
                });        
            }).catch((err) => {
                reject(err); 
            });
    });
};

/********* -Record functions ********/

const findRecord = (Model, filter={}, select={}) => {
    return Model.findOne(filter, select).then((result) => {
        if (!result) 
            throw new NotFoundError(notFoundMessage);
        // Convert result to object 
        // so can show only value of selected field 
        // instead of name of selected field and value 
        result = result.toObject();
        const resultKeys = Object.keys(result),
            filterKeys = Object.keys(filter);
        if (resultKeys.length === 1) result = result[resultKeys[0]];
        let paramName = filterKeys[filterKeys.length -1];

        // If filter field is an embedded document 
        // or nested object ('genre.name')
        // get only portion that includes param name 
        if (paramName.includes('.')) 
            paramName = paramName.slice(
                paramName.indexOf('.')+1,
                paramName.length);
        
        // delete field that includes param name since that field is not needed
        delete result[paramName]; 

        if (result.hasOwnProperty('__v'))
            // delete version key field as user does not need this info     
            delete result['__v'];        
        
        return result;
    });
};

const findRecords = (Model, filter={}, select={}, sort={}) => {
    return Model.find(filter, select).sort(sort).then((results) => {
        if (!results) 
            throw new NotFoundError(notFoundMessage);        
        results.forEach((result, i) => {
            // Convert result to object 
            // so can delete version key field as user does not need this info
            result = result.toObject();
            if (result.hasOwnProperty('__v')) delete result['__v'];  
            results[i] = result;
        });
        
        return results;
    });
}; 

/******** Exports *********/

module.exports.findRecord = findRecord;
module.exports.findRecords = findRecords;
module.exports.getList = getList;
module.exports.editList = editList;