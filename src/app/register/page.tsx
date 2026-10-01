import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/components/layout/auth-form';

export const metadata: Metadata = { title: 'Create an account', robots: { index: false } };

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
