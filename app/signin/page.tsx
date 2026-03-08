import React from 'react'
import SignIn from '../components/SignIn'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const page = async () => {
  const session = await auth()
  if (session) {
    redirect('/')
  }
  return (
    <div>
        <SignIn/>
    </div>
  )
}

export default page