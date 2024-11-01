import { ModalProvider } from '@/provider/modal-provider';
import './globals.css';
import { PropsWithChildren, useEffect, useState } from 'react';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <ModalProvider>{children}</ModalProvider>
      </body>
    </html>
  );
}
