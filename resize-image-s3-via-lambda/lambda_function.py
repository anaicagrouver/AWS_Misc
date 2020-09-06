import boto3
import os
import sys
import uuid
from PIL import Image
import PIL.Image
     
s3_client = boto3.client('s3')
     
def resize_image(image_path, resized_path, size):
    with Image.open(image_path) as image:
        image.thumbnail((size, size))
        image.save(resized_path)
     
def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key'] 
        print(key)
        download_path = '/tmp/1.jpg' 
        #print(download_path)
        upload_path = '/tmp/1600-2.jpg' 
        #print(upload_path)
        upload_path2 = '/tmp/1400-3.jpg'
        #print(upload_path2)
        s3_client.download_file(bucket, key, download_path)
        resize_image(download_path, upload_path, 1600)
        resize_image(download_path, upload_path2, 1400)
        print(bucket)
        s3_client.upload_file(upload_path, bucket, 'resized1400/' + key.split('/')[1])
        s3_client.upload_file(upload_path2, bucket, 'resized1600/' + key.split('/')[1])
