import Link from 'next/link';
import { btn } from '@/components/ui';
import { getDict } from '@/i18n/server';

export default async function NotFound() {
  const { t } = await getDict();
  return (
    <section className="wrap grid min-h-[50vh] place-items-center py-20 text-center">
      <div>
        <p className="tabular font-display text-7xl font-extrabold text-teal">404</p>
        <h1 className="mt-3 text-3xl">{t.common.notFound}</h1>
        <Link href="/" className={`${btn()} mt-6`}>{t.common.home}</Link>
      </div>
    </section>
  );
}
