import 'dotenv/config';
import fs from 'fs';
import mime from 'mime-types';
import {
    S3Client,
    PutObjectCommand
} from '@aws-sdk/client-s3';

// Credenciais vêm do .env (veja .env.example)
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.S3_BUCKET;

export async function uploadFile(filePath, fileName, folder = '') {
    try {
        const fileStream = fs.createReadStream(filePath);
        const contentType = mime.lookup(filePath) || 'application/octet-stream';

        const key = folder ? `${folder}/${fileName}` : fileName;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileStream,
            ContentType: contentType
        };

        await s3.send(new PutObjectCommand(uploadParams));

        const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
        return fileUrl;
    } catch (err) {
        console.error('Erro ao subir arquivo para o S3:', err);
        throw err;
    }
}
