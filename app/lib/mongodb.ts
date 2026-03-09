import clientPromise from "./db"

export async function getDatabase() {
  const client = await clientPromise
  return client.db("keydash")
}