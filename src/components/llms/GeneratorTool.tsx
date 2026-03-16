import { useState, useRef } from "react";
import { Globe, Loader2, Search, XCircle } from "lucide-react";
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

function fetchWithTimeout(
  url: string,
  timeoutMs = 8000,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Link external abort signal
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  return fetch(url, { signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

async function fetchSitemap(
  baseUrl: string,
  signal?: AbortSignal
): Promise<string[]> {
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap`,
  ];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const res = await fetchWithTimeout(
        CORS_PROXY + encodeURIComponent(sitemapUrl),
        8000,
        signal
      );
      if (!res.ok) continue;
      const text = await res.text();
      if (!text.includes("<url") && !text.includes("<sitemap")) continue;

      const sitemapMatches = [
        ...text.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi),
      ];
      const urls: string[] = [];

      if (text.includes("<sitemapindex") || text.includes("<sitemap>")) {
        // Fetch ALL child sitemaps in parallel (batch of 10)
        const childUrls = sitemapMatches.map((m) => m[1]);
        for (let i = 0; i < childUrls.length; i += 10) {
          if (signal?.aborted) break;
          const batch = childUrls.slice(i, i + 10);
          const childResults = await Promise.allSettled(
            batch.map(async (childUrl) => {
              const childRes = await fetchWithTimeout(
                CORS_PROXY + encodeURIComponent(childUrl),
                8000,
                signal
              );
              if (!childRes.ok) return [];
              const childText = await childRes.text();
              return [
                ...childText.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi),
              ].map((m) => m[1]);
            })
          );
          for (const r of childResults) {
            if (r.status === "fulfilled") urls.push(...r.value);
          }
        }
      } else {
        sitemapMatches.forEach((m) => urls.push(m[1]));
      }

      if (urls.length > 0) return urls;
    } catch {
      /* try next */
    }
  }
  return [];
}

async function fetchPageTitle(
  url: string,
  signal?: AbortSignal
): Promise<string> {
  try {
    const res = await fetchWithTimeout(
      CORS_PROXY + encodeURIComponent(url),
      6000,
      signal
    );
    if (!res.ok) return "";
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
    return titleMatch?.[1]?.replace(/\s+/g, " ").trim() || "";
  } catch {
    return "";
  }
}

function urlToTitle(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return u.hostname;
    const last = parts[parts.length - 1];
    return last
      .replace(/[-_]/g, " ")
      .replace(/\.\w+$/, "")
      .replace(/\b\w/g, (c) => c.toUpperCase());
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
      setProgress({ step: "Scanning homepage...", detail: baseUrl, pct: 10 });
      const homeMeta = await fetchPageMeta(baseUrl, signal);

      if (signal.aborted) return;

      // Step 2: Fetch sitemap
      setProgress({ step: "Looking for sitemap...", detail: "", pct: 20 });
      let discoveredUrls = await fetchSitemap(baseUrl, signal);

      if (signal.aborted) return;

      // Deduplicate
      discoveredUrls = [...new Set(discoveredUrls)];
      const totalFound = discoveredUrls.length;

      if (totalFound === 0) {
        discoveredUrls = [baseUrl];
      }

      // Process up to 500 pages
      const urlsToProcess = discoveredUrls.slice(0, 500);

      setProgress({
        step: `Found ${totalFound} pages, fetching titles...`,
        detail: `Processing ${urlsToProcess.length} pages`,
        pct: 35,
      });

      // Step 3: Fetch real page titles in parallel batches of 20
      const pages: { url: string; title: string }[] = [];
      const BATCH_SIZE = 20;

      for (let i = 0; i < urlsToProcess.length; i += BATCH_SIZE) {
        if (signal.aborted) return;

        const batch = urlsToProcess.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(
          batch.map(async (pageUrl) => {
            const fetchedTitle = await fetchPageTitle(pageUrl, signal);
            return {
              url: pageUrl,
              title: fetchedTitle || urlToTitle(pageUrl),
            };
          })
        );

        for (const r of batchResults) {
          if (r.status === "fulfilled") {
            pages.push(r.value);
          }
        }

        const processed = Math.min(i + BATCH_SIZE, urlsToProcess.length);
        setProgress({
          step: `Fetching titles... ${processed}/${urlsToProcess.length}`,
          detail: batch[0],
          pct: 35 + Math.floor((processed / urlsToProcess.length) * 55),
        });
      }

      if (signal.aborted) return;

      setProgress({
        step: "Generating llms.txt file...",
        detail: "",
        pct: 95,
      });
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
