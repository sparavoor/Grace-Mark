import './globals.css';

export const metadata = {
  title: 'Grace Mark | Management Portal',
  description: 'Enterprise-grade meeting tracking and performance audit system.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
