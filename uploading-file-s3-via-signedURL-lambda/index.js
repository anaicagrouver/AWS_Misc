const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION })
const s3 = new AWS.S3();

const uploadBucket = 'BUCKET NAME'

exports.handler = async (event) => {
  const result = await getUploadURL(JSON.parse(event.body).key)
  //console.log(result)
  return result
};

const getUploadURL = async function(aid) {
  let actionId = aid //get name from API call 

  var s3Params = {
    Bucket: uploadBucket,
    Key:  `PREFIX/${actionId}`,
    ContentType: 'image/jpeg', //can be changed as per requirement 
    CacheControl: 'max-age=31104000',
    ACL: 'public-read',   //can be read via object URL
  };

  return new Promise((resolve, reject) => {
    let uploadURL = s3.getSignedUrl('putObject', s3Params)
    resolve({
      "statusCode": 200,
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*" //allows all origins
      },
      "body": JSON.stringify({
          "uploadURL": uploadURL,
          "photoFilename": `PREFIX/${actionId}`
      })
    })
  })
}
