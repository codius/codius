import { Octokit } from "@octokit/rest";
import { Storage } from "@google-cloud/storage";

const octokit = new Octokit({ auth: `token YOUR_GITHUB_TOKEN` });
const storage = new Storage();
const bucketName = 'your-bucket-name';
const repo = {
  owner: 'username',
  repo: 'repo-name'
};

export const createBucket = async (id: string) => {
  const [bucket] = await storage.createBucket(id, {
    enableObjectRetention: true,
  })
  return bucket
}

async function uploadFileToGCS(contentUrl: string, filePath: string) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);
  const response = await octokit.request('GET', contentUrl);
  const buffer = Buffer.from(response.data.content, 'base64');
  await file.save(buffer);
  console.log(`Uploaded ${filePath} to ${bucketName}`);
}

async function processDirectory(contentUrl: string, path: string) {
  const result = await octokit.request('GET', contentUrl);
  for (const item of result.data) {
    if (item.type === 'file') {
      await uploadFileToGCS(item.url, item.path);
    } else if (item.type === 'dir') {
      await processDirectory(item.url, item.path);
    }
  }
}

// TODO: only upload files referenced in manifest
// export async function uploadGithubRepo() {
//   const result = await octokit.repos.getContent({
//     owner: repo.owner,
//     repo: repo.repo,
//     path: ''  // Start at the root of the repository
//   });

//     if (result.type === 'file') {
//       await uploadFileToGCS(item.url, item.path);
//     } else if (result.type === 'dir') {
//       await processDirectory(item.url, item.path);
//     }
//   }
// }
