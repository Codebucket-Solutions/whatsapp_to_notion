const fs = require("fs");
const util = require('util');
const path = require("path");
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

class Local {
  constructor(options) {
    let {folderPath,baseUrl} = options;
    this.baseUrl = baseUrl;
    if (!path.isAbsolute(folderPath)) {
      folderPath = path.join(__dirname, folderPath);
    }
    if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true });
		}
    this.folderPath = folderPath;
  }

  async upload(options) {
    let {fileName, mediaStream} = options;
    let filePath = path.join(this.folderPath,fileName);
    await pipeline(mediaStream, fs.createWriteStream(filePath));
    let data = {filePath}
    if(this.baseUrl) {
      let downloadUrl = this.baseUrl+'/'+fileName;
      data = {...data,downloadUrl}
    }
    return data;
  }

}

module.exports = {
  Local,
};
