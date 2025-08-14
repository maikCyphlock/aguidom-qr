import { getAuthenticatedUserFromServer } from '@/lib/auth/server'
import Client from './client'

async function page() {
    const {userFromDb } = await getAuthenticatedUserFromServer()
    if (userFromDb.role !== 'admin') {
        return (
           <div>
                <h1>No tienes permisos para acceder a esta página</h1>
            </div>
        ) 
    }
  return (
    <div className="flex-1 w-full flex flex-col p-2 items-center">
        <Client/>
    </div>
  )
}

export default page