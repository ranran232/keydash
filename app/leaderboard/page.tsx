import React, { Suspense } from 'react'
import Leaderboards from '../components/Leaderboards'
import { getAllUsers } from '../lib/models/user'
import { auth } from '@/auth'

export default async function Page(props: { searchParams: Promise<{ sort?: string }> }) {
  const searchParams = await props.searchParams
  const sortBy = searchParams.sort === 'wpm' ? 'wpm' : 'highestScore'
  const session = await auth()
  const users = await getAllUsers(sortBy)
  const plainUsers = users.slice(0, 10).map(({ _id, ...rest }) => rest)
  const currentUserEmail = session?.user?.email || null
  
  return (
    <div>
        <Suspense fallback={<div className="text-white">Loading...</div>}>
          <Leaderboards users={plainUsers} sortBy={sortBy} currentUserEmail={currentUserEmail} />
        </Suspense>
    </div>
  )
}
