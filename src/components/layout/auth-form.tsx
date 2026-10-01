'use client';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Field, inputCls } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import { ApiError, DEMO } from '@/lib/client';
import { isAgencyStaff, useAuth } from '@/store/auth';

const VillaScene = dynamic(() => import('@/components/three/villa-scene'), { ssr: false });

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const next = useSearchParams().get('next');
  const { login, register } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setErr(null);
    try {
      const email = String(f.get('email'));
      const password = String(f.get('password'));
      const me =
        mode === 'login'
          ? await login(email, password)
          : await register({ email, password, fullName: String(f.get('fullName')), phone: String(f.get('phone') || '') || undefined, locale: lang });
      toast(t.auth.signedIn);
      // Only follow same-site relative redirects.
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      router.push(safeNext ?? (isAgencyStaff(me) ? '/dashboard' : '/account'));
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="wrap pt-8">
      <div className="grid min-h-[560px] overflow-hidden rounded-[28px] border border-line bg-surface md:grid-cols-2">
        <div className="relative min-h-[260px] bg-[#173f4b]">
          <VillaScene interactive={false} autoRotate zoom={1.05} className="absolute inset-0" />
          <p className="absolute inset-x-8 bottom-7 font-display text-[26px] leading-tight text-white">{t.auth.art}</p>
        </div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center p-[clamp(24px,5vw,56px)]">
          <h1 className="mb-1.5 text-[34px]">{mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}</h1>
          <p className="mb-6 text-muted">{mode === 'login' ? t.auth.loginSub : t.auth.registerSub}</p>
          <form onSubmit={submit} className="grid gap-3">
            {mode === 'register' && (
              <Field label={t.auth.fullName} htmlFor="r-name"><input id="r-name" name="fullName" required minLength={2} autoComplete="name" className={inputCls} /></Field>
            )}
            <Field label={t.auth.email} htmlFor="l-email"><input id="l-email" name="email" type="email" required autoComplete="email" className={inputCls} defaultValue={DEMO && mode === 'login' ? 'aisha@saraya.om' : ''} /></Field>
            <Field label={t.auth.password} htmlFor="l-pass" hint={mode === 'register' ? t.auth.passwordHint : undefined}>
              <input id="l-pass" name="password" type="password" required minLength={mode === 'register' ? 8 : 1} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className={inputCls} defaultValue={DEMO && mode === 'login' ? 'Mawtin2026!' : ''} />
            </Field>
            {mode === 'register' && (
              <Field label={t.auth.phone} htmlFor="r-phone"><input id="r-phone" name="phone" type="tel" autoComplete="tel" pattern="^\+?[0-9 ]{7,20}$" className={inputCls} /></Field>
            )}
            {err && <p role="alert" className="rounded-xl bg-bad-bg px-3 py-2 text-[13px] text-bad">{err}</p>}
            <Button type="submit" disabled={busy} className="mt-1">
              {busy ? t.common.loading : mode === 'login' ? t.auth.login : t.auth.register}
              <ArrowRight className="rtl-flip" />
            </Button>
            {DEMO && <p className="text-xs text-muted">{t.auth.demo}</p>}
            <p className="text-sm text-muted">
              {mode === 'login' ? t.auth.noAccount : t.auth.haveAccount}{' '}
              <Link href={mode === 'login' ? '/register' : '/login'} className="font-semibold text-teal hover:underline">
                {mode === 'login' ? t.auth.createOne : t.auth.signInLink}
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
