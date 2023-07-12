const { Client } = require("@notionhq/client")
class Notion {
    
    constructor(options) {
        let {token,databaseId} = options;
        this.token = token;
        this.databaseId = databaseId;
        this.notionClient = new Client({
            auth: token,
        })
    }

    async addPage(data) {
        let {properties,children} = data;
        if(!children)
            children = [];
        await this.notionClient.pages.create({
            "parent": {
                "type": "database_id",
                "database_id": this.databaseId
            },
            properties,
            children
        })
    }

    
}

module.exports = {
    Notion
};