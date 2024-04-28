import envs from '@/envs'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Menu from '../components/structural/Menu'
import GlobalContextProvider, { GlobalProviderType } from '../providers/GlobalProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default:'Bruno Valero',
    template:'%s | Bruno Valero'
  },
  description: 'Organize, Agilize e Simplifique o seu Negócio',
}

export default function RootLayout({ 
  children, 
}: { 
  children: React.ReactNode 
}) { 

  const fromServer:GlobalProviderType['fromServer'] = { 
    envs, 
  };

  return ( 
    <html lang="en"> 
      <GlobalContextProvider fromServer={fromServer} > 
        <body className={inter.className}>          
          <Menu>
            <main className="flex w-full h-full flex-col items-center justify-center">        
              {children}
            </main>
          </Menu>
        </body> 
      </GlobalContextProvider> 
    </html> 
  ) 
}
