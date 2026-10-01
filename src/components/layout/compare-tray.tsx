'use client';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { btn } from '@/components/ui';
import { useI18n } from '@/i18n/client';
import { cn } from '@/lib/utils';
import { useCompare } from '@/store/shortlist';

export function CompareTray() {
  const { t } = useI18n();
  const items = useCompare((s) => s.items);
  const clear = useCompare((s) => s.clear);
  const path = usePathname();
  const show = items.length > 0 && path !== '/compare' && !path.startsWith('/dashboard');

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, x: '-50%' }}
          animate={{ y: 0, x: '-50%' }}
          exit={{ y: 120, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed bottom-[calc(18px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 flex max-w-[calc(100vw-32px)] items-center gap-3.5 rounded-[20px] bg-[#133741] py-2.5 pe-2.5 ps-4 text-white shadow-[0_20px_50px_rgba(0,0,0,.3)]"
          role="region"
          aria-label={t.compare.title}
        >
          <div className="flex gap-1.5">
            {items.map((i) => (
              <Image key={i.id} src={i.images[0]?.url ?? '/homes/villa.webp'} alt="" width={44} height={36} className="h-9 w-11 rounded-lg object-cover" />
            ))}
          </div>
          <span className="tabular hidden text-[13px] sm:inline">{items.length} / 3</span>
          <Link href="/compare" aria-disabled={items.length < 2} className={cn(btn({ variant: 'white', size: 'sm' }), items.length < 2 && 'pointer-events-none opacity-50')}>
            {t.compare.now}
          </Link>
          <button type="button" onClick={clear} aria-label={t.compare.clear} className="grid size-9 place-items-center rounded-full border border-[#3d6570] [&_svg]:size-4">
            <X />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
