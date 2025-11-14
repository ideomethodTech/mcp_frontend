import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/contexts/auth-context';
import { ApiProvider } from '@/lib/api/provider';

export const metadata = {
  title: 'AI Learning Hub',
  description: 'An AI-powered chat and content generation platform.',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ApiProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ApiProvider>
        <Toaster />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}