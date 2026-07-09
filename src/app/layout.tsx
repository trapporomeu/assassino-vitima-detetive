import type {Metadata} from 'next';
import { Orbitron } from 'next/font/google';
import './globals.css'; // Global styles

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Impostor • Jogo de Investigação',
  description: 'O clássico jogo social de Assassino, Detetive e Vítima. Sorteie papéis secretamente e observe cada piscada de olho!',
  icons: {
    icon: '/icon.jpg',
    shortcut: '/favicon.jpg',
    apple: '/icon.jpg',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={orbitron.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
