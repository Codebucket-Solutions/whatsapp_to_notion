const drive = require("@googleapis/drive");
const fs = require("fs");
const path = require("path");
class GDrive {
  constructor(options) {
    let { serviceAccountKey, serviceAccountKeyPath } = options;
    try {
      
      if(!path.isAbsolute(path)) {
        serviceAccountKeyPath = path.join(__dirname,serviceAccountKey)
      }

      if (serviceAccountKey && !fs.existsSync(serviceAccountKeyPath)) {
        fs.writeFileSync(
          serviceAccountKeyPath,
          serviceAccountKey,
          "utf8"
        );
      }
      let auth = new drive.auth.GoogleAuth({
        keyFilename: serviceAccountKeyPath,
        scopes: ["https://www.googleapis.com/auth/drive"],
      });

      this.drive = drive.drive({
        version: "v3",
        auth,
      });
    } catch (e) {
      console.log(e);
    }
  }

  async uploadFile(options) {
    let { fileName, mimeType, mediaStream } = options;
    let data = await this.drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
      },
      media: {
        mimeType: mimeType,
        body: mediaStream,
      },
    });

    return data;
  }

  async addPermissions(options) {
    let { role, type, fileId } = options;
    await this.drive.permissions.create({
      fileId,
      requestBody: { role, type },
    });
  }

  async get(options) {
    let { fileId } = options;
    let file = await this.drive.files.get({ fileId });
    return file;
  }
}

module.exports = {
  GDrive,
};
