import React from 'react'
import Client from './client'
import { getAuthenticatedUserFromServer } from '@/lib/auth/server'

async function page() {
    const { userFromDb } = await getAuthenticatedUserFromServer()
    
    if (userFromDb.role !== 'admin') {
        return (
           <div>
                <h1>No tienes permisos para acceder a esta página</h1>
            </div>
        ) 
    }

    // Verificar que el usuario tenga un club
    if (!userFromDb.clubId) {
        return (
            <div>
                <h1>No tienes un club asignado</h1>
            </div>
        )
    }

  return (
    <div className="flex-1 w-full flex flex-col p-2 items-center">
        <Client clubId={userFromDb.clubId} />
    </div>
  )
}

export default page