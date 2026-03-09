import { MongoClient } from "mongodb"

const uri = process.env.MONGO_DB_URI!

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClient: MongoClient | undefined
  var _mongoPromise: Promise<MongoClient> | undefined
}

if (!global._mongoClient) {
  client = new MongoClient(uri)
  global._mongoClient = client
  global._mongoPromise = client.connect()
}

client = global._mongoClient
clientPromise = global._mongoPromise!

export default clientPromise