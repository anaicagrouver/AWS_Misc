'use strict';
const fs = require('fs');
const AWS = require("aws-sdk");

const Archiver = require('archiver');
const Stream = require('stream');

const https = require('https');
const sslAgent = new https.Agent({
  KeepAlive: true,
  rejectUnauthorized: true
});
sslAgent.setMaxListeners(0);
AWS.config.update({
  httpOptions: {
    agent: sslAgent,
  },
  region: 'REGION'
});

module.exports = class S3Zip {
  constructor(params, bucketName = 'BUCKET NAME') {
    this.params = params;
    this.BucketName = bucketName;
  }

  async process() {
    const { params, BucketName } = this;
    const s3 = new AWS.S3({ apiVersion: '2006-03-01', params: { Bucket: BucketName } });
      
    const createReadStream = fs.createReadStream;
    const s3FileDwnldStreams = params.files.map(item => {
  
      const stream = s3.getObject({ Key: item.key }).createReadStream();
      return {
        stream,
        fileName: item.fileName
      }
    });

    const streamPassThrough = new Stream.PassThrough();
    
    const uploadParams = {
      ACL: 'public-read',
      Body: streamPassThrough,
      ContentType: 'application/zip',
      Key: params.zippedFileKey
    };

    const s3Upload = s3.upload(uploadParams, (err, data) => {
      if (err) {
        console.error('upload err', err)
      } else {
        console.log('upload data', data);
      }
    });

    s3Upload.on('httpUploadProgress', progress => {
      // console.log(progress);
    });

    const archive = Archiver('zip', {
      zlib: { level: 0 }
    });
    archive.on('error', (error) => {
      throw new Error(`${error.name} ${error.code} ${error.message} ${error.path} ${error.stack}`);
    });

    await new Promise((resolve, reject) => {
      console.log("Starting upload of the output Files Zip Archive");

      s3Upload.on('close', resolve());
      s3Upload.on('end', resolve());
      s3Upload.on('error', reject());

      archive.pipe(streamPassThrough);
      s3FileDwnldStreams.forEach((s3FileDwnldStream) => {
        archive.append(s3FileDwnldStream.stream, { name: s3FileDwnldStream.fileName })
      });
      archive.finalize();

    }).catch((error) => {
      throw new Error(`${error.code} ${error.message} ${error.data}`);
    });

    await s3Upload.promise();

  }
}
