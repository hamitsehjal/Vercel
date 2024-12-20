const path = require('path');
const { spawn } = require('child_process');
const { readdirSync, lstatSync } = require('fs');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { simpleGit } = require('simple-git');
const { generateSlug } = require('random-word-slugs');
// Upload the build to S3

// instantiate a new S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function uploadToS3(file, key) {
    try {
        const putCommand = new PutObjectCommand({
            Key: key,
            Body: file,
            Bucket: process.env.AWS_S3_BUCKET_NAME,
        });

        await s3Client.send(putCommand);
        console.log(`[SUCCESS]: File ${file} uploaded to S3`);
    } catch (error) {
        throw new Error(
            `Error uploading FILE: ${file} to S3 [ERROR DETAILS]: ${err.message}`
        );
    }
}

async function init() {
    const githubUrl = process.env.GITHUB_URL;
    try {
        // clone this GitHub Repo
        const slug = generateSlug();

        const git = simpleGit();
        const outputDir = path.join(__dirname, 'temp', slug);
        await git.clone(githubUrl, outputDir);

        console.log(`Cloning Finished - ${slug}`);

        // Build the repo
        const buildCommand = spawn(
            `cd ${outputDir} && npm install && npm i -D esbuild@0.24.0 && npm run build`,
            {
                shell: true,
            }
        );

        buildCommand.stdout.on('data', (data) => {
            console.log(`[STDOUT]: ${data}`);
        });

        buildCommand.stderr.on('data', (data) => {
            console.log(`[STDERR]: ${data}`);
        });

        buildCommand.on('close', async (code) => {
            console.log(`Build Command exited with Code: ${code}`);
            console.log(`Building Finished - ${slug}`);
            const buildDirectory = path.join(outputDir, 'dist');
            try {
                const filenames = readdirSync(buildDirectory, {
                    recursive: true,
                });
                console.log(filenames);

                for (const filename of filenames) {
                    const filepath = path.join(buildDirectory, filename);

                    const stats = lstatSync(filepath);

                    if (stats.isDirectory()) {
                        continue;
                    } else if (stats.isFile()) {
                        await uploadToS3(filepath, filename);
                    }
                }

                console.log(`Build Published - ${slug}`);
            } catch (err) {
                console.log(
                    `Error publishing Build Repo - ${buildDirectory} [ERROR DETAILS]: ${err.message}`
                );
            }
        });
    } catch (err) {
        console.log(
            `Error cloning Repo - ${githubUrl} [ERROR DETAILS]: ${err.message}`
        );
    }
}

init();
