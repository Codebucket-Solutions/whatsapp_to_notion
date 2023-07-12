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
const { GDrive } = require("../../../utils/upload");
const mime = require('mime-types')

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
      switch(message.type) {
        case "text":
          await this.textMessageHandler(message,value);
          break;
        case "document":
          await this.documentMessageHandler(message,value);
          break;
        default:
          await this.textMessageHandler(message,value);
          break;
      }
    })

    this.notionApi = new Notion({
      databaseId:process.env.NOTION_DATABASE_ID,
      token:process.env.NOTION_TOKEN
    })

    this.gDriveApi = new GDrive({
      serviceAccountKey:process.env.SERVICE_ACCOUNT_KEY
      ,serviceAccountKeyPath:process.env.SERVICE_ACCOUNT_KEY_PATH
    })

  }

  async commonHandler(message,value,objectKey=null) {
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

    if(objectKey) {
      let mediaId = message[objectKey].id;
      let mimeType = message[objectKey].mime_type;
      let fileName = mediaId+'.'+mime.extension(mimeType)
      let caption = message[objectKey].caption?message[objectKey].caption:"";

      return {
        timestamp,
        dateString,
        phoneNumberId,
        messageId,
        from,
        replyId,
        dateObject,
        name,
        mediaId,
        mimeType,
        fileName,
        caption
      }
    }

    return {
      timestamp,
      dateString,
      phoneNumberId,
      messageId,
      from,
      replyId,
      dateObject,
      name
    }
  }

  async createNotionPayload(props) {
    let {name,tags,date,urls,file,messageId,entireText} = props;
    let properties = {};
    let children = [];
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

    if(entireText)
      children.push(
        notionProps.paragraph([notionProps.text(entireText)])
      )

    if(urls) {
      children.push(
        ...urls.map(url=>notionProps.embed(notionProps.url(url)))
      )
    }

    if(file) {
      children.push(
        notionProps.embed(notionProps.url(file))
      )
    }

    return {
      properties,children
    }
  }

  async textMessageHandler(message,value) {
    
    let {messageId,phoneNumberId,dateObject} = await this.commonHandler(message,value)

    let text = '';
    if(message.text) {
      if(message.text.body)
        text = message.text.body
    }

    let processedText = processText(text);

    let notionPayload = await this.createNotionPayload({
      name:processedText.text,
      tags:processedText['#'],
      urls:processedText.links,
      date:dateObject,
      messageId,
      entireText:text
    })

    await this.notionApi.addPage(notionPayload);

    await this.whatsappCloudApi.markMessageAsRead(phoneNumberId,messageId);
  }

  async documentMessageHandler (message,value) {
    try {
      let {messageId,phoneNumberId,dateObject,mediaId,mimeType,fileName,caption} = await this.commonHandler(message,value,'document');
    
      let processedText = processText(caption);
  
      let fileData = await this.whatsappCloudApi.getMediaUrl(mediaId);
  
      let mediaStream = await this.whatsappCloudApi.getMediaStream(fileData.data.url);
  
      let driveFileData = await this.gDriveApi.uploadFile({fileName,mimeType,mediaStream});
  
      let fileId = driveFileData.data.id;
  
      await this.gDriveApi.addPermissions({fileId,role: 'reader',type: 'anyone'});
  
      driveFileData = await this.gDriveApi.get({fileId});
  
      let fileUrl = driveFileData.data.webViewLink;
  
      let notionPayload = await this.createNotionPayload({
        name:processedText.text,
        tags:processedText['#'],
        urls:processedText.links,
        date:dateObject,
        messageId:messageId,
        entireText:text,
        file:fileUrl
      })
  
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
