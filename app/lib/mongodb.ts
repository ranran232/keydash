import clientPromise from "./db"

let db: any

export async function getDatabase() {
  if (db) return db
  
  const client = await clientPromise
  db = client.db("keydash")
  return db
}
