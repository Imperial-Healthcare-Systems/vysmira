'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    VYSMIRA?: { boot: () => void; initPage: () => void };
    __vysChromeBooted?: boolean;
  }
}

/** Renders one page of the original single-file build and re-runs the
 *  page-scoped behaviour (reveals, counters, form validation) after Next
 *  swaps the route in. */
export default function PageBody({ nav, html }: { nav: string; html: string }) {
  useEffect(() => {
    document.body.setAttribute('data-page', nav);
    document.querySelectorAll('.nav-link[data-nav]').forEach((el) => el.classList.remove('is-active'));

    let timer: ReturnType<typeof setInterval> | undefined;
    const run = () => {
      if (!window.VYSMIRA) return false;
      // First paint may land before /site.js executes; boot() covers both cases.
      window.__vysChromeBooted ? window.VYSMIRA.initPage() : window.VYSMIRA.boot();
      return true;
    };

    if (!run()) {
      timer = setInterval(() => {
        if (run() && timer) clearInterval(timer);
      }, 50);
      setTimeout(() => timer && clearInterval(timer), 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [nav, html]);

  return <div className="view" dangerouslySetInnerHTML={{ __html: html }} />;
}
