export const metadata = {
  title: 'NEERAKSHAK Backend Engine | Next.js App Router',
  description: 'NEERAKSHAK Flood Relief Management System Next.js API & Database Hub',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0b192c', color: '#f1f5f9' }}>
        {children}
      </body>
    </html>
  );
}
