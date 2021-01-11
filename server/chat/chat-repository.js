/**
 * Model to access directally the model
 */

const chat = require("./chat-model");
const uuid = require('uuid/v1');

class ChatRepository {
    // constructor() {
    //     (async () =>{
    //         /** connect to database */
    //         await connectToDatabase();
    //     })();
    // }
    
    // FIND FOR ALL CATEGORIES
    async find(params) {
        return await chat.find(params);
    }

    //  UPDATES A SINGLE CATEGORY IN THE DATABASE
    async updateOne(data) {
        const id = data._id
        delete data._id
        return await chat.findByIdAndUpdate(id, data, {new: true},res => res);
    }

    //  UPDATES A SINGLE CATEGORY IN THE DATABASE
    async create(data) {
        data.uuid = uuid();
        return await chat.create(data);
    }
}
module.exports = new ChatRepository();