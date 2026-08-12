'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/** The chrome is injected as raw HTML, so its <a> tags are plain anchors.
 *  This turns internal ones into client-side navigations and cleans up the
 *  menu state the old hash router used to reset on every route change. */
export default function NavEnhancer() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;
      if (a.hasAttribute('download') || (a.getAttribute('target') && a.getAttribute('target') !== '_self')) return;
      e.preventDefault();
      router.push(href);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [router]);

  useEffect(() => {
    document.querySelectorAll('.mega.is-open').forEach((el) => el.classList.remove('is-open'));
    document.querySelectorAll('[data-mega-trigger]').forEach((el) => el.setAttribute('aria-expanded', 'false'));
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileNav?.classList.contains('is-open')) {
      mobileNav.classList.remove('is-open');
      document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
