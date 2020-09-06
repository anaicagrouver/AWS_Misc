'use strict';
const S3Zip = require('./s3-zip');
const AWS = require("aws-sdk");
var fs = require('fs');

const params = {
  files: [
    {
      fileName: '1.jpg',
      key: 'coverart/1.jpg'
    }
  ],
  zippedFileKey: 'zip/zipped-file-key.zip'
}; 

exports.handler = async event => {
  const s3Zip = new S3Zip(param);
  await s3Zip.process();
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Zip file successfully added!'
      }
    )
  };

};
