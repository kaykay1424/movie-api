/********* Functions  ********/

/********* -List functions ********/

const getList = (req, res, Model, filter={}, select={}, populate={}) => {    
    // Make sure user id used belongs to the user that is logged in
    if (filter._id !== String(req.user._id)) return res.status(400).send('You cannot edit this user\'s info');
    
    Model.findOne(filter, select).populate(populate).exec((err, list) => { 
        if (err) throw err;
        list = list[populate];
        res.status(200).json(list);
    });
};
const editList = (req, res, list, item_id, action, Users) => {
    // Make sure path params and body params match
    if (req.body[item_id] !== req.params[item_id]) return res.status(400).send('Request body and path parameters do not match.');
   
    const filter = {_id: req.params.id},
        listID = req.body[item_id];

    // Make sure user id used belongs to the user that is logged in
    if (filter._id !== String(req.user._id)) return res.status(400).send('You cannot edit this user\'s info');
    
    // Find user
    Users.findOne(filter).then((existingUser) => { // eslint-disable-line indent
        const updateCondition = {};
        let updateMessage = ``;
        
        if (action == 'add') {
            // Check if item is already in user's list
            if (existingUser[list].indexOf(listID) > -1) return res.status(400).send(`That item is already in your ${list} list. Try adding another one.`);
        
            updateCondition['$push'] = {};
            updateCondition['$push'][list] = listID;
            updateMessage = `Item with ID ${listID} has been added to your ${list} list.`;
        } else if (action === 'remove') {
            // Check if movie exists in user's movie list
            if (existingUser[list].indexOf(listID) < 0) return res.status(400).send(`That movie is not in your ${list} list. Try removing another one.`);
            
            updateCondition['$pull'] = {};
            updateCondition['$pull'][list] = listID;
            updateMessage = `Item with ID ${listID} has been removed from your ${list} list.`; 
        }

        Users.findOneAndUpdate(filter, updateCondition).then(() => {
            res.status(201).send(updateMessage);
        }).catch((err) => {
            console.error(err); // eslint-disable-line
            res.status(500).send(err);
        });        
    }).catch((err) => {
        console.error(err); // eslint-disable-line
        res.status(500).send(err);
    });
};

/********* -Record functions ********/

const findRecord = (res, Model, filter={}, select={}) => {
    Model.findOne(filter, select).then((result) => {
        if (!result) return res.status(400).send('No results found');
        // Convert result to object so can show only value of selected field instead of name of selected field and value 
        result = result.toObject();
        const resultKeys = Object.keys(result),
            filterKeys = Object.keys(filter);
        if (resultKeys.length === 1) result = result[resultKeys[0]];
        let paramName = filterKeys[filterKeys.length -1];

        // If filter field is an embedded document or nested object ('genre.name')
        // get only portion that includes param name 
        if (paramName.includes('.')) paramName = paramName.slice(paramName.indexOf('.')+1, paramName.length);
        
        delete result[paramName]; // delete field that includes param name since that field is not needed

        if (result.hasOwnProperty('__v')) delete result['__v']; // delete version key field as user does not need this info
        res.status(200).json(result);
    }).catch((err) => {
        console.error(err); // eslint-disable-line
        res.status(500).send(err);
    }); 
};

const findRecords = (res, Model, filter={}, select={}, sort={}) => {
    Model.find(filter, select).sort(sort).then((results) => {
        if (!results) return res.status(400).send('No results found');
        
        results.forEach((result, i) => {
            // Convert result to object so can delete version key field as user does not need this info
            result = result.toObject();
            if (result.hasOwnProperty('__v')) delete result['__v'];  
            results[i] = result;
        });
        
        res.status(200).json(results);
    }).catch((err) => {
        console.error(err); // eslint-disable-line
        res.status(500).send(err);
    });
}; 

/******** Exports *********/

module.exports.findRecord = findRecord;
module.exports.findRecords = findRecords;
module.exports.getList = getList;
module.exports.editList = editList;