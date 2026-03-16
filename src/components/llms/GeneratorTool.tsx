import { useState, useRef } from "react";
import { Globe, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface CrawlResult {
  websiteUrl: string;
  siteName: string;
  description: string;
  pages: { url: string; title: string }[];
}

interface GeneratorToolProps {
  onGenerate: (data: CrawlResult) => void;
}

const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const MAX_PAGES = 1000;

function fetchWithTimeout(
  url: string,
  timeoutMs = 8000,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }
  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

/** Check robots.txt for Sitemap: directives */
async function getSitemapUrlsFromRobots(
  baseUrl: string,
  signal?: AbortSignal
): Promise<string[]> {
  try {
    const res = await fetchWithTimeout(
      CORS_PROXY + encodeURIComponent(`${baseUrl}/robots.txt`),
      6000,
      signal
    );
    if (!res.ok) return [];
    const text = await res.text();
    const matches = [...text.matchAll(/^Sitemap:\s*(.+)$/gim)];
    return matches.map((m) => m[1].trim()).filter(Boolean);
  } catch {
    return [];
  }
}

/** Parse URLs from a sitemap XML string */
function extractLocsFromXml(text: string): string[] {
  return [...text.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi)].map((m) => m[1]);
}

/** Fetch and parse a single sitemap, recursing into sitemap indexes */
async function parseSitemap(
  sitemapUrl: string,
  signal?: AbortSignal
): Promise<string[]> {
  try {
    const res = await fetchWithTimeout(
      CORS_PROXY + encodeURIComponent(sitemapUrl),
      10000,
      signal
    );
    if (!res.ok) return [];
    const text = await res.text();
    if (!text.includes("<loc")) return [];

    const locs = extractLocsFromXml(text);

    // If it's a sitemap index, fetch all child sitemaps
    if (text.includes("<sitemapindex") || text.includes("<sitemap>")) {
      const urls: string[] = [];
      // Fetch child sitemaps in parallel batches of 15
      for (let i = 0; i < locs.length; i += 15) {
        if (signal?.aborted) break;
        const batch = locs.slice(i, i + 15);
        const results = await Promise.allSettled(
          batch.map(async (childUrl) => {
            const childRes = await fetchWithTimeout(
              CORS_PROXY + encodeURIComponent(childUrl),
              10000,
              signal
            );
            if (!childRes.ok) return [];
            const childText = await childRes.text();
            return extractLocsFromXml(childText);
          })
        );
        for (const r of results) {
          if (r.status === "fulfilled") urls.push(...r.value);
        }
      }
      return urls;
    }

    return locs;
  } catch {
    return [];
  }
}

/** Main sitemap discovery: robots.txt → common sitemap paths */
async function discoverAllUrls(
  baseUrl: string,
  signal?: AbortSignal,
  onProgress?: (msg: string) => void
): Promise<string[]> {
  const allUrls = new Set<string>();

  // 1. Check robots.txt for sitemap URLs
  onProgress?.("Checking robots.txt...");
  const robotsSitemaps = await getSitemapUrlsFromRobots(baseUrl, signal);
  if (signal?.aborted) return [];

  // 2. Build list of sitemaps to try
  const sitemapsToTry = new Set<string>(robotsSitemaps);
  sitemapsToTry.add(`${baseUrl}/sitemap.xml`);
  sitemapsToTry.add(`${baseUrl}/sitemap_index.xml`);
  sitemapsToTry.add(`${baseUrl}/sitemap`);
  // Common CMS sitemap patterns
  sitemapsToTry.add(`${baseUrl}/sitemap-index.xml`);
  sitemapsToTry.add(`${baseUrl}/wp-sitemap.xml`);
  sitemapsToTry.add(`${baseUrl}/post-sitemap.xml`);
  sitemapsToTry.add(`${baseUrl}/page-sitemap.xml`);
  sitemapsToTry.add(`${baseUrl}/sitemap/sitemap-index.xml`);

  // 3. Fetch all sitemaps in parallel batches
  const sitemapList = [...sitemapsToTry];
  onProgress?.(`Scanning ${sitemapList.length} sitemap locations...`);

  // Fetch in parallel batches of 5
  for (let i = 0; i < sitemapList.length; i += 5) {
    if (signal?.aborted) break;
    const batch = sitemapList.slice(i, i + 5);
    const results = await Promise.allSettled(
      batch.map((url) => parseSitemap(url, signal))
    );
    for (const r of results) {
      if (r.status === "fulfilled") {
        r.value.forEach((u) => allUrls.add(u));
      }
    }
    if (allUrls.size > 0) {
      onProgress?.(`Found ${allUrls.size} pages so far...`);
    }
  }

  // 4. Fallback: crawl internal links from homepage
  if (allUrls.size === 0 && !signal?.aborted) {
    onProgress?.("No sitemap found, crawling homepage links...");
    try {
      const res = await fetchWithTimeout(
        CORS_PROXY + encodeURIComponent(baseUrl),
        10000,
        signal
      );
      if (res.ok) {
        const html = await res.text();
        const host = new URL(baseUrl).hostname;
        // Extract all internal links
        const linkMatches = [
          ...html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi),
          ...html.matchAll(/href=["'](\/[^"']+)["']/gi),
        ];
        for (const m of linkMatches) {
          let href = m[1];
          if (href.startsWith("/")) {
            href = baseUrl + href;
          }
          try {
            const u = new URL(href);
            if (
              u.hostname === host &&
              !u.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|pdf|zip)$/i)
            ) {
              allUrls.add(u.origin + u.pathname);
            }
          } catch {
            /* skip */
          }
        }
        onProgress?.(`Found ${allUrls.size} links from homepage`);
      }
    } catch {
      /* fallback failed */
    }
  }

  return [...allUrls];
}

function urlToTitle(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Home";
    return parts
      .map((p) =>
        p
          .replace(/[-_]/g, " ")
          .replace(/\.\w+$/, "")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      )
      .join(" › ");
  } catch {
    return url;
  }
}

async function fetchPageMeta(
  url: string,
  signal?: AbortSignal
): Promise<{ title: string; description: string }> {
  try {
    const res = await fetchWithTimeout(
      CORS_PROXY + encodeURIComponent(url),
      8000,
      signal
    );
    if (!res.ok) return { title: "", description: "" };
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
    const descMatch =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["'](.*?)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["'](.*?)["'][^>]+name=["']description["']/i
      );
    return {
      title: titleMatch?.[1]?.replace(/\s+/g, " ").trim() || "",
      description: descMatch?.[1]?.trim() || "",
    };
  } catch {
    return { title: "", description: "" };
  }
}

const GeneratorTool = ({ onGenerate }: GeneratorToolProps) => {
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ step: "", detail: "", pct: 0 });
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setProgress({ step: "", detail: "", pct: 0 });
  };

  const handleGenerate = async () => {
    let inputUrl = url.trim();
    if (!inputUrl) {
      setError("Please enter a website URL");
      return;
    }
    if (!inputUrl.startsWith("http")) {
      inputUrl = "https://" + inputUrl;
    }
    try {
      new URL(inputUrl);
    } catch {
      setError("Invalid URL");
      return;
    }

    setError("");
    setIsGenerating(true);

    const abortController = new AbortController();
    abortRef.current = abortController;
    const signal = abortController.signal;

    let baseUrl: string;
    try {
      baseUrl = new URL(inputUrl).origin;
    } catch {
      baseUrl = inputUrl;
    }

    try {
      // Step 1: Fetch homepage meta
      setProgress({ step: "Scanning homepage...", detail: baseUrl, pct: 5 });
      const homeMeta = await fetchPageMeta(baseUrl, signal);
      if (signal.aborted) return;

      // Step 2: Discover all URLs
      setProgress({ step: "Discovering pages...", detail: "", pct: 15 });
      const discoveredUrls = await discoverAllUrls(baseUrl, signal, (msg) => {
        setProgress((prev) => ({ ...prev, detail: msg }));
      });
      if (signal.aborted) return;

      // Deduplicate & filter same-origin
      const host = new URL(baseUrl).hostname;
      const uniqueUrls = [
        ...new Set(
          discoveredUrls.filter((u) => {
            try {
              return new URL(u).hostname.includes(host);
            } catch {
              return false;
            }
          })
        ),
      ];

      const totalFound = uniqueUrls.length;

      if (totalFound === 0) {
        uniqueUrls.push(baseUrl);
      }

      // Limit to MAX_PAGES
      const urlsToProcess = uniqueUrls.slice(0, MAX_PAGES);

      setProgress({
        step: `Found ${totalFound} pages, building file...`,
        detail: `Using ${urlsToProcess.length} pages`,
        pct: 80,
      });

      // Step 3: Build page list with URL-derived titles (fast, no fetching)
      const pages = urlsToProcess.map((pageUrl) => ({
        url: pageUrl,
        title: urlToTitle(pageUrl),
      }));

      setProgress({ step: "Generating llms.txt file...", detail: "", pct: 95 });
      await new Promise((r) => setTimeout(r, 200));

      const siteName =
        homeMeta.title?.split(/[|\-–—]/)[0]?.trim() ||
        new URL(baseUrl).hostname;

      setIsGenerating(false);
      setProgress({ step: "", detail: "", pct: 0 });

      onGenerate({
        websiteUrl: baseUrl,
        siteName,
        description: homeMeta.description,
        pages,
      });
    } catch (err) {
      if (signal.aborted) return;
      console.error("Scan error:", err);
      setError("Failed to scan website. Please try again.");
      setIsGenerating(false);
      setProgress({ step: "", detail: "", pct: 0 });
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-saas-lg p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-card-foreground">
          LLMs.txt Generator
        </h2>
      </div>

      <p className="text-muted-foreground mb-6">
        Enter your website URL — we'll automatically crawl your sitemap and
        generate an llms.txt file for you.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="yourdomain.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          onKeyDown={(e) =>
            e.key === "Enter" && !isGenerating && handleGenerate()
          }
          className={`flex-1 h-12 text-base ${error ? "border-destructive" : ""}`}
          disabled={isGenerating}
        />
        {isGenerating ? (
          <Button
            onClick={handleCancel}
            variant="destructive"
            className="h-12 px-6 gap-2"
          >
            <XCircle className="h-4 w-4" /> Cancel
          </Button>
        ) : (
          <Button onClick={handleGenerate} className="h-12 px-6 gap-2">
            <Search className="h-4 w-4" /> Generate llms.txt
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive mt-2 flex items-center gap-1">
          ⚠ {error}
        </p>
      )}

      {isGenerating && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{progress.step}</span>
            <span>{progress.pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          {progress.detail && (
            <p className="text-xs text-muted-foreground truncate">
              {progress.detail}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GeneratorTool;
