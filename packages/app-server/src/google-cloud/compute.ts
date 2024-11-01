import compute from "@google-cloud/compute"

const client = new compute.UrlMapsClient()

async function createUrlMap(id: string) {
  client.insert({
    urlMapResource: {
      name: "id",
      defaultRouteAction: {
        urlRewrite: {
          pathPrefixRewrite: "/static",
        },
      },
    },
  })
  await urlMap.create({
    defaultService: compute.backendBucket(backendBucketName).metadata.selfLink,
  })
  console.log(`URL map ${urlMapName} created.`)
}

async function createBackendBucket() {
  const backendBucket = compute.BackendBucketsClient.backendBucket(backendBucketName)
  await backendBucket.create({
    bucketName,
  })
  console.log(`Backend bucket ${backendBucketName} created.`)
}

async function setupLoadBalancer() {
  try {
    await createBackendBucket()
    await createUrlMap()
  } catch (error) {
    console.error("Failed to set up load balancer:", error)
  }
}

setupLoadBalancer()
