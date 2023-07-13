class Upload {
  constructor(options) {
    let { uploader } = options;
    switch (uploader) {
      case "Google Drive":
        let { GDrive } = require("./gdrive");
        this.uploader = new GDrive(options);
        break;
      case "Local":
        let { Local } = require("./local");
        this.uploader = new Local(options);
        break;
      case "Default":
        throw { message: `Uploader Type ${uploader} Not Found` };
    }
  }

  async upload(options) {
    return await this.uploader.upload(options);
  }
}

module.exports = {
  Upload,
};
