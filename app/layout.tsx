import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AMO - Apoio ao Ensino Acadêmico',
  description: 'Plataforma de apoio ao ensino acadêmico e à comunidade Russana',
  icons: {
    icon: [
      {
        url: '/1.svg',
        type: 'image/svg+xml',
      },
    ],

  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
