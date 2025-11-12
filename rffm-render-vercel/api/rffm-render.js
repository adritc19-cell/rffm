import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const config = {
  maxDuration: 20,
};

export default async function handler(req, res) {
  try {
    const { target, selector = '', table_hint = 'PTS' } = req.query;
    if (!target) {
      res.status(400).json({ error: 'missing target param' });
      return;
    }

    // Launch headless Chrome
    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36');
    await page.goto(target, { waitUntil: 'networkidle2', timeout: 20000 });

    // Helper to get node outerHTML by selector or first table containing hint
    const html = await page.evaluate(({ selector, table_hint }) => {
      const hint = (table_hint || '').toUpperCase();
      function outer(n){ return n ? n.outerHTML : ''; }

      if (selector) {
        const el = document.querySelector(selector);
        if (el) return outer(el);
      }

      // Try any table that includes hint text
      const tables = Array.from(document.querySelectorAll('table'));
      for (const t of tables) {
        const text = (t.textContent || '').toUpperCase();
        if (!hint || text.includes(hint)) return outer(t);
      }

      // Fallback: look for obvious containers
      const cont = document.querySelector('[class*="clasif"], [class*="tabla"], [id*="clasif"], [id*="tabla"]');
      if (cont) return outer(cont);

      return '';
    }, { selector, table_hint });

    await browser.close();

    if (!html) {
      res.status(404).json({ error: 'no-node-found' });
      return;
    }
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=86400');
    res.status(200).json({ html });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
}
