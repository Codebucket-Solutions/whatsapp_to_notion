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

    async getPages(data) {
        let {filter,sorts} = data;

        let payload = {
            database_id: this.databaseId,
        };

        if (filter) { payload = { ...payload,filter } }

        if (sorts) { payload = { ...payload,sorts } }
            
        const pages =  this.notionClient.databases.query(payload);
        
        return pages;
    }

    async addComment(data) {
        let {pageId,discussionId,richText} = data;
        
        let payload = {...richText}

        if(pageId) 
            payload = {...payload,parent:{page_id:pageId}}

        if(discussionId) 
            payload = {...payload,discussion_id:discussionId}

        this.notionClient.comments.create(payload)
    } 

    
}

module.exports = {
    Notion
};