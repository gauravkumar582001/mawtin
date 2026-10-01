'use client';
import { Layers } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink, btn } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import type { PropertyCard } from '@/lib/types';
import { omr, pick } from '@/lib/utils';
import { useCompare } from '@/store/shortlist';

export default function ComparePage() {
  const { t, lang } = useI18n();
  const items = useCompare((s) => s.items);
  const toggle = useCompare((s) => s.toggle);

  const head = (
    <section className="wrap pb-6 pt-9">
      <div className="eyebrow">{t.compare.eyebrow}</div>
      <h1 className="mt-2 text-[clamp(30px,3.6vw,48px)]">{t.compare.title}</h1>
    </section>
  );

  if (items.length < 2)
    return (
      <>
        {head}
        <section className="wrap">
          <div className="rounded-[22px] border border-dashed border-line px-5 py-16 text-center text-muted">
            <Layers className="mx-auto size-8" />
            <h2 className="mb-1.5 mt-3 text-xl text-ink">{t.compare.empty}</h2>
            <p>{t.compare.emptyP}</p>
            <ButtonLink href="/properties?purpose=buy" className="mt-5">{t.featured.viewAll}</ButtonLink>
          </div>
        </section>
      </>
    );

  const perSqm = (c: PropertyCard) => c.price / c.builtUpArea;
  const minPrice = Math.min(...items.map((c) => c.price));
  const minSqm = Math.min(...items.map(perSqm));
  const maxSize = Math.max(...items.map((c) => c.builtUpArea));
  const best = (label: string) => <span className="ms-1.5 inline-block rounded-lg bg-ok-bg px-2 py-px text-[11px] font-semibold text-ok">{label}</span>;

  const rows: [string, (c: PropertyCard) => React.ReactNode][] = [
    [t.compare.price, (c) => <><b className="tabular font-display text-lg">{omr(c.price)}</b>{c.price === minPrice && best(t.compare.lowest)}</>],
    [t.compare.perSqm, (c) => <><span className="tabular">{omr(perSqm(c))}</span>{perSqm(c) === minSqm && best(t.compare.lowest)}</>],
    [t.search.location, (c) => pick(lang, c.area.name, c.area.nameAr)],
    [t.search.type, (c) => t.typeOne[c.type]],
    [t.detail.beds, (c) => <span className="tabular">{c.bedrooms}</span>],
    [t.detail.baths, (c) => <span className="tabular">{c.bathrooms}</span>],
    [t.detail.size, (c) => <><span className="tabular">{c.builtUpArea}</span>{c.builtUpArea === maxSize && best(t.compare.largest)}</>],
    [t.detail.amenities, (c) => c.amenities.map((a) => t.amenity[a] ?? a).join(', ')],
    [t.detail.listedBy, (c) => pick(lang, c.agency.name, c.agency.nameAr)],
  ];

  return (
    <>
      {head}
      <section className="wrap">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-x-auto rounded-[22px] border border-line bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <tbody>
              <tr>
                <th className="w-[170px]" />
                {items.map((c) => (
                  <td key={c.id} className="border-b border-line p-4 align-top">
                    <div className="relative h-[130px] overflow-hidden rounded-xl">
                      <Image src={c.images[0]?.url ?? '/homes/villa.webp'} alt="" fill sizes="300px" className="object-cover" />
                    </div>
                    <Link href={`/properties/${c.slug}`} className="mt-2.5 block font-semibold hover:text-teal">{pick(lang, c.title, c.titleAr)}</Link>
                    <button type="button" onClick={() => toggle(c)} className="text-[12.5px] font-semibold text-teal">{t.compare.remove}</button>
                  </td>
                ))}
              </tr>
              {rows.map(([label, cell]) => (
                <tr key={label}>
                  <th scope="row" className="border-b border-line p-4 text-start align-top font-medium text-muted">{label}</th>
                  {items.map((c) => (
                    <td key={c.id} className="border-b border-line p-4 align-top">{cell(c)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <th />
                {items.map((c) => (
                  <td key={c.id} className="p-4">
                    <Link href={`/properties/${c.slug}`} className={btn({ size: 'sm' })}>{t.compare.view}</Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </motion.div>
      </section>
    </>
  );
}
