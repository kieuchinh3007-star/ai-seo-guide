import { useState } from "react";
import { Globe, Loader2, Search } from "lucide-react";
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

async function fetchSitemap(baseUrl: string): Promise<string[]> {
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap`,
  ];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const res = await fetch(CORS_PROXY + encodeURIComponent(sitemapUrl));
      if (!res.ok) continue;
      const text = await res.text();
      if (!text.includes("<url") && !text.includes("<sitemap")) continue;

      // Parse sitemap index (contains nested sitemaps)
      const sitemapMatches = [...text.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi)];
      const urls: string[] = [];

      if (text.includes("<sitemapindex") || text.includes("<sitemap>")) {
        // It's a sitemap index, fetch each child sitemap
        for (const match of sitemapMatches.slice(0, 5)) {
          try {
            const childRes = await fetch(CORS_PROXY + encodeURIComponent(match[1]));
            if (!childRes.ok) continue;
            const childText = await childRes.text();
            const childUrls = [...childText.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi)];
            childUrls.forEach((m) => urls.push(m[1]));
          } catch {
            /* skip */
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

async function fetchPageMeta(
  url: string
): Promise<{ title: string; description: string }> {
  try {
    const res = await fetch(CORS_PROXY + encodeURIComponent(url));
    if (!res.ok) return { title: "", description: "" };
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const descMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["'](.*?)["']/i
    ) || html.match(
      /<meta[^>]+content=["'](.*?)["'][^>]+name=["']description["']/i
    );
    return {
      title: titleMatch?.[1]?.trim() || "",
      description: descMatch?.[1]?.trim() || "",
    };
  } catch {
    return { title: "", description: "" };
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

const GeneratorTool = ({ onGenerate }: GeneratorToolProps) => {
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ step: "", detail: "", pct: 0 });
  const [error, setError] = useState("");

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

    let baseUrl: string;
    try {
      baseUrl = new URL(inputUrl).origin;
    } catch {
      baseUrl = inputUrl;
    }

    // Step 1: Fetch homepage meta
    setProgress({ step: "Scanning homepage...", detail: baseUrl, pct: 10 });
    const homeMeta = await fetchPageMeta(baseUrl);

    // Step 2: Fetch sitemap
    setProgress({ step: "Looking for sitemap...", detail: "", pct: 30 });
    let discoveredUrls = await fetchSitemap(baseUrl);

    // Deduplicate and limit
    discoveredUrls = [...new Set(discoveredUrls)];
    const totalFound = discoveredUrls.length;

    if (totalFound === 0) {
      // Fallback: just use the homepage
      discoveredUrls = [baseUrl];
    }

    // Limit to 50 pages for processing
    const urlsToProcess = discoveredUrls.slice(0, 50);

    setProgress({
      step: `Found ${totalFound} pages, processing...`,
      detail: `Processing ${urlsToProcess.length} pages`,
      pct: 50,
    });

    // Step 3: Build page list with titles
    const pages: { url: string; title: string }[] = [];
    for (let i = 0; i < urlsToProcess.length; i++) {
      const pageUrl = urlsToProcess[i];
      const title = urlToTitle(pageUrl);
      pages.push({ url: pageUrl, title });

      if (i % 10 === 0) {
        setProgress({
          step: `Processing page ${i + 1}/${urlsToProcess.length}...`,
          detail: pageUrl,
          pct: 50 + Math.floor((i / urlsToProcess.length) * 40),
        });
      }
    }

    setProgress({ step: "Generating llms.txt file...", detail: "", pct: 95 });
    await new Promise((r) => setTimeout(r, 300));

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
        Enter your website URL — we'll automatically crawl your sitemap and generate an llms.txt file for you.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="yourdomain.com"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
          className={`flex-1 h-12 text-base ${error ? "border-destructive" : ""}`}
          disabled={isGenerating}
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-12 px-6 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Scanning...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" /> Generate llms.txt
            </>
          )}
        </Button>
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
