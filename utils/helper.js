const camelcaseKeys = require("camelcase-keys");
const _ = require('lodash');
module.exports = {
  camelize: (obj, stopPaths = []) => {
    try {
      return camelcaseKeys(JSON.parse(JSON.stringify(obj)), {
        deep: true,
        stopPaths: stopPaths,
      });
    } catch (error) {
      throw error;
    }
  },

  processText: (text) => {

    function isValidHttpUrl(string) {
      let url;
      
      try {
        url = new URL(string);
      } catch (_) {
        return false;  
      }
    
      return url.protocol === "http:" || url.protocol === "https:";
    }

    let textWords = text.split(/[\s\n\r]/gim);
    let groupedText = _.groupBy(textWords,(textWord)=>{
      if(textWord.startsWith('#'))
        return "#"
      if(isValidHttpUrl(text))
        return "links"
      return "text"
    })

    if(groupedText['#']&&groupedText['#'].length>0) 
      groupedText['#'] = groupedText['#'].map(x=>x.substring(1)).filter(x=>x.length>0);
    else
      groupedText['#'] =[]
    if(groupedText.text) 
      groupedText.text = groupedText.text.join(" ");
    else
      groupedText.text = "";
    if(!groupedText.links){
      groupedText.links=[]
    }

    return groupedText
  }

};
