from pydub import AudioSegment
import boto3 
import botocore
import os
s3 = boto3.resource('s3', 'us-west-2', config=botocore.config.Config(s3={'addressing_style':'path'}))
s3_client = boto3.client('s3')

from pydub.utils import which
AudioSegment.converter = which("ffmpeg")

def lambda_handler(event, context):
    #the below code is for a s3 trigger
    #record = event['Records'][0]['s3']
    #bucket_name = record['bucket']['name']
    #key = record['object']['key'].replace("+", " ")
    #below code is for manual entry
    bucket_name = 'BUCKET NAME'
    key = 'PREFIX/AUDIO NAME'
    
    input_file = key.split('/')[1]
    
    fname = input_file.split('.')[0]
    #the below code uses EFS, tmp also can be used
    
    #empty EFS
    for i in os.listdir('/mnt/access'):
        os.remove('/mnt/access/' + i); 

    s3.Bucket(bucket_name).download_file(key, '/mnt/access/1.wav')
    #to check if file is downloaded correctly
    #print(os.path.exists(f'/mnt/access/1.wav'))
    
    sound = AudioSegment.from_file(r'/mnt/access/1.wav').export(f"/mnt/access/1.mp3", format="mp3")
    
    #print(os.listdir('/mnt/access'))
    
    #upload file back in s3
    s3_client.upload_file('/mnt/access/1.mp3', BUCKET NAME, 'mp3/{}.mp3'.format(file-name))
    return "done" 
