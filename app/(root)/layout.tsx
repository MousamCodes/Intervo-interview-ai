import Link from 'next/link'
import {ReactNode} from 'react'
import Image from 'next/image'
import { isAuthenticated } from '@/lib/actions/auth.action'
import { redirect } from 'next/navigation'
const RootLayout =async ({ children}: {children: ReactNode}) =>{

  const isUserAuthenticated = await isAuthenticated();
  
  if(!isUserAuthenticated) redirect ('/sign-in');// Replace with actual authentication logic
    return(
      <div className='root-layout'>
        <nav>
          <Link href="/" className='flex items-center gap-2'>
          <Image src ="/logo.svg" alt="Intervo Logo" height={32} width={38}/>
          <h2 className="text-primary-100 ">Intervo</h2>
          </Link>
        </nav>
        {children}
      </div>
    )
  }

  

export default RootLayout
