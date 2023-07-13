let { auth:_auth, drive:_drive } = require("@googleapis/drive");
let { existsSync, mkdirSync, writeFileSync } = require("fs");
let {isAbsolute, join, dirname } = require("path");


function checkIfJson (jsonString){
  try {
      var o = JSON.parse(jsonString);
      if (o && typeof o === "object") {
          return o;
      }
  }
  catch (e) { }
  return false;
};

class GDrive {
  constructor(options) {
    let { serviceAccountKey, serviceAccountKeyPath, folderName, folderId } =
      options;
    this.folderName = folderName;
    this.folderId = folderId;
    if (!isAbsolute(serviceAccountKeyPath)) {
      serviceAccountKeyPath = join(__dirname, serviceAccountKeyPath);
    }

    let directory = dirname(serviceAccountKeyPath);

    if (!existsSync(directory)) mkdirSync(directory, { recursive: true });

    if (serviceAccountKey && !existsSync(serviceAccountKeyPath)) {
      if(!checkIfJson(serviceAccountKey)) {
        serviceAccountKey = JSON.stringify(serviceAccountKey)
      }
      writeFileSync(serviceAccountKeyPath, serviceAccountKey, "utf8");
    }
    let auth = new auth.GoogleAuth({
      keyFilename: serviceAccountKeyPath,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    this.drive = _drive({
      version: "v3",
      auth,
    });
  }

  async createFolder(options) {
    let { folderName } = options;

    let requestBody = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };

    let data = await this.drive.files.create({
      requestBody,
      fields: "id",
    });

    return data;
  }

  async uploadFile(options) {
    let { fileName, mimeType, mediaStream, folderId } = options;

    let requestBody = {
      name: fileName,
      mimeType: mimeType,
    };

    if (folderId) requestBody = { ...requestBody, parents: [folderId] };

    let data = await this.drive.files.create({
      requestBody,
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

  async getWebViewLink(options) {
    let { fileId } = options;
    let file = await this.drive.files.get({
      fileId,
      fields: "webViewLink,webContentLink",
    });
    return file;
  }

  async upload(options) {
    let { fileName, mimeType, mediaStream, role, type } = options;

    let folderId = null;
    if (folderId) {
      folderId = this.folderId;
    } else if (this.folderName) {
      let folder = await this.createFolder({ folderName: this.folderName });
      folderId = folder.data.id;
    }

    let driveFileData = await this.uploadFile({
      fileName,
      mimeType,
      mediaStream,
      folderId,
    });
    let fileId = driveFileData.data.id;
    if (role && type) await this.addPermissions({ fileId, role, type });
    driveFileData = await this.getWebViewLink({ fileId });
    let downloadUrl = driveFileData.data.webContentLink;
    let embedUrl = driveFileData.data.webViewLink.replace("/view", "/preview");
    return {
      downloadUrl,
      embedUrl,
    };
  }
}

module.exports = {
  GDrive,
};
