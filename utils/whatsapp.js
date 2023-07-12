const axios = require('axios');
const util = require('util');
const stream = require('stream');
const fs = require('fs');
const pipeline = util.promisify(stream.pipeline);
const EventEmitter = require("events");

class WhatsappWebhook extends EventEmitter {
  
    constructor(options){
        super();
        let {webhookVerifyToken} = options;
        this.webhookVerifyToken = webhookVerifyToken;
    }
    
    async messageChangeHandler (value) {
        let {messages} = value;
        for(let message of messages) {
            this.emit("message",message,value);
        }
    }

    async defaultChangeHandler(value) {}

    async changeHandler (changes) {
        for(let change of changes) {
            switch(change.field) {
                case "messages":
                    await this.messageChangeHandler(change.value);
                    break;
                default:
                    await this.defaultChangeHandler(change.value);
                    break;
            }
        }
    }

    async webhookHandler(data) {
        if(data.entry) {
            for(let ent of data.entry) {
                if(ent.changes) {
                    await this.changeHandler(ent.changes);
                }
            }
        }
    }

    async webhookVerify(body) {
        if (body["hub.verify_token"] == this.webhookVerifyToken) {
            return body["hub.challenge"];
        }
        return false;
    }

}

class WhatsappCloudApi {

    constructor(options) {
        let {baseUrl,accessToken} = options;
        this.baseUrl = baseUrl;
        this.accessToken = accessToken;
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
              "Authorization": `Bearer ${this.accessToken}`,
            }
          });
    };

    async getMediaUrl(mediaId) {
        let data = await this.axiosInstance.get(`/${mediaId}/`);
        return data;
    }

    async saveMedia(url,downloadPath) {
        let request = await this.axiosInstance.get(url,{
            responseType: 'stream',
        });
        await pipeline(request.data, fs.createWriteStream(downloadPath));
        return downloadPath;
    }

    async getMediaStream(url) {
        let request = await this.axiosInstance.get(url,{
            responseType: 'stream',
        });
        return request.data
    }

    async markMessageAsRead(phoneNumberId,messageId) {
        let data = await this.axiosInstance.post(`/${phoneNumberId}/messages`,{
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": `${messageId}`
        });
        return data;
    }

}



module.exports = {
    WhatsappWebhook,
    WhatsappCloudApi
};