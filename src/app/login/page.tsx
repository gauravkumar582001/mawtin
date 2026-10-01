import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/components/layout/auth-form';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
