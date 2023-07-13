const {
  ErrorHandler,
  statusCodes
} = require("../../../helper");
const {
  constant,
  WhatsappWebhook,
  WhatsappCloudApi,
  Notion,
  notionProps,
  processText
} = require("../../../utils");
const { SERVER_ERROR, BAD_GATEWAY } = statusCodes;
const {
  OTP_VERIFIED,
  INVALID_OTP,
  INVALID_CREDENTIALS,
  INVALID_PASSWORD,
  SUCCESS,
} = constant;
const moment = require('moment-timezone');
const { Upload } = require("../../../utils/upload");
const mime = require('mime-types');

class Auth {
  constructor() {
    
    this.whatsappCloudApi = new WhatsappCloudApi({
      baseUrl:process.env.GRAPH_API_BASEURL,
      accessToken:process.env.WHATSAPP_ACCESS_TOKEN
    }); 

    this.whatsappWebhook = new WhatsappWebhook({
      webhookVerifyToken:process.env.WEBHOOK_VERIFY_TOKEN
    });

    this.whatsappWebhook.on("message", async (message,value)=>{
      await this.messageHandler(message,value);
    });

    this.notionApi = new Notion({
      databaseId:process.env.NOTION_DATABASE_ID,
      token:process.env.NOTION_TOKEN
    });

    this.uploadApi = new Upload(JSON.parse(process.env.UPLOAD));

  }

  async commonHandler(message,value,messageType=null) {
    let {metadata,contacts} = value;
    let timestamp = message.timestamp;
    let dateString = moment.unix(timestamp).tz('Asia/Kolkata').format("YYYY-MM-DD HH:mm:ss");
    let dateObject = moment.unix(timestamp).tz('Asia/Kolkata').toDate()
    let phoneNumberId = metadata.phone_number_id;
    let messageId = message.id;
    let from = message.from;
    let replyId = null;
    if(message.context)
      replyId = message.context.id;
    
    let name = "";
    if(contacts && contacts.length) {
      if(contacts[0].profile && contacts[0].profile.name) {
        name = contacts[0].profile.name;
      }
    }

    let data = {
      timestamp,
      dateString,
      phoneNumberId,
      messageId,
      from,
      replyId,
      dateObject,
      name
    }

    if(messageType && messageType!='text') {
      let mediaId = message[messageType].id;
      let mimeType = message[messageType].mime_type;
      let fileName = mediaId+'.'+mime.extension(mimeType)
      let caption = message[messageType].caption?message[messageType].caption:"";

      data= {...data,mediaId,mimeType,fileName,caption}
    }

    return data
  }

  async createNotionPayload(props) {
    let {name,tags,date,urls,file,embed,messageId,entireText,replyId} = props;
    let properties = {};
    let children = [];
    
    if(replyId) {
      let comment = []
      if(entireText) {
        comment.push(notionProps.text(entireText))
      }
      if(urls) {
        comment.push(
          ...urls.map(url=>notionProps.text(url+'\n',notionProps.url(url)))
        )
      }
      if(file) {
        comment.push(
          notionProps.text(file+'\n',notionProps.url(file))
        )
      }

      return {richText:notionProps.richText(comment)}
    }

    if(entireText)
      children.push(
        notionProps.paragraph([notionProps.text(entireText)])
      )

    if(urls) {
      children.push(
        ...urls.map(url=>notionProps.embed(notionProps.url(url)))
      )
    }

    if(embed) {
      children.push(
        notionProps.embed(notionProps.url(embed))
      )
    }

    
    if(name)
      properties['Name'] = notionProps.pageTitle(name);
    if(tags) {
      tags = tags.map(t=>({name:t}));
      properties['Tags'] = notionProps.multiSelect(tags);
    }
    if(date) {
      properties['Date'] = notionProps.date(date);
    }
    if(urls) {
      properties['URLs'] = notionProps.richText(urls.map(url=>notionProps.text(url+'\n',notionProps.url(url))));
    }
    if(file) {
      properties['File'] = notionProps.url(file)
    }
    if(messageId) {
      properties['Message Id'] = notionProps.richText([notionProps.text(messageId)])
    }

    return {
      properties,children
    }
  }

  async messageHandler (message,value) {
    try {
      let {messageId,phoneNumberId,dateObject,mediaId,mimeType,fileName,caption,replyId} = await this.commonHandler(message,value,message.type);
      let processedText = {}
      let text = '';   
      if(message.type!='text')
        processedText = processText(caption);
      else {
        if(message.text) {
          if(message.text.body)
            text = message.text.body
        }
        processedText = processText(text);
      }
        

      processedText['#'].push(message.type);

      let file = null;
      let embed = null;

      if(message.type!='text') {
        let fileData = await this.whatsappCloudApi.getMediaUrl(mediaId);
  
        let mediaStream = await this.whatsappCloudApi.getMediaStream(fileData.data.url);
  
        let {downloadUrl,embedUrl} = await this.uploadApi.upload(
          {
            fileName,mimeType,mediaStream,role:'reader',type:'anyone',
          }
        )
  
        file = downloadUrl;
        embed = embedUrl;
        if(!embed)
          embed = downloadUrl;
      }
  
      let notionPayload = await this.createNotionPayload({
        name:processedText.text,
        tags:processedText['#'],
        urls:processedText.links,
        date:dateObject,
        messageId:messageId,
        entireText:message.type!='text'?caption:text,
        file,
        embed,
        replyId:replyId
      })

      if(replyId) {
        let page = await this.notionApi.getPages({
          filter: {property:"Message Id","rich_text": {"equals": replyId}}
        })
        let richText = notionPayload.richText;
        if(page.results.length) {
          let pageId = page.results[0].id;
          await this.notionApi.addComment({pageId,richText})
        }
      } else
        await this.notionApi.addPage(notionPayload);
  
      await this.whatsappCloudApi.markMessageAsRead(phoneNumberId,messageId);
    } catch (e) {
      console.log(e);
    }
  }

  async webhook(body) {
    try {
      await this.whatsappWebhook.webhookHandler(body);
    } catch (e) {
      console.log(e);
    }
    return true;
  }

  async webhookVerify(body) {
    return await this.whatsappWebhook.webhookVerify(body);
  }
}

module.exports = Auth;
