import { useState } from "react";
import { Copy, Download, RefreshCw, Check, Shield, ShieldAlert, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { GeneratorData } from "./GeneratorTool";

interface ResultSectionProps {
  data: GeneratorData;
  onRegenerate: () => void;
}

const CRAWLER_MAP: Record<string, string> = {
  gptbot: "GPTBot",
  claudebot: "ClaudeBot",
  perplexitybot: "PerplexityBot",
  "google-extended": "Google-Extended",
  common: "CommonCrawl",
};

const CRAWLER_DISPLAY: Record<string, string> = {
  gptbot: "ChatGPT",
  claudebot: "Claude",
  perplexitybot: "Perplexity",
  "google-extended": "Gemini",
  common: "Common Crawlers",
};

function generateLlmsTxt(data: GeneratorData): string {
  const lines: string[] = [];
  const name = data.websiteName || new URL(data.websiteUrl).hostname;
  lines.push(`# ${name} AI Content Guide`);
  lines.push("");

  if (data.websiteDescription) {
    lines.push(`# ${data.websiteDescription}`);
    lines.push("");
  }

  const allCrawlerIds = ["gptbot", "claudebot", "perplexitybot", "google-extended", "common"];

  for (const id of allCrawlerIds) {
    const agent = CRAWLER_MAP[id] || id;
    if (data.crawlers.includes(id) && data.allowAccess) {
      lines.push(`User-agent: ${agent}`);
      lines.push("Allow: /");
    } else {
      lines.push(`User-agent: ${agent}`);
      lines.push("Disallow: /");
    }
    lines.push("");
  }

  if (data.sitemapUrl) {
    lines.push(`Sitemap: ${data.sitemapUrl}`);
    lines.push("");
  }

  const pages = data.importantPages
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  if (pages.length > 0) {
    lines.push("Important:");
    pages.forEach((p) => lines.push(p));
    lines.push("");
  }

  return lines.join("\n");
}

const ResultSection = ({ data, onRegenerate }: ResultSectionProps) => {
  const [copied, setCopied] = useState(false);
  const content = generateLlmsTxt(data);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "llms.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded");
  };

  const allCrawlerIds = ["gptbot", "claudebot", "perplexitybot", "google-extended", "common"];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Generated llms.txt File</h2>

      <div className="rounded-xl overflow-hidden shadow-saas-lg">
        <pre className="bg-code text-code-foreground p-6 overflow-x-auto text-sm leading-relaxed font-mono">
          {content}
        </pre>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCopy} variant="outline" className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy llms.txt"}
        </Button>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Download file
        </Button>
        <Button onClick={onRegenerate} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Regenerate
        </Button>
      </div>

      {/* Crawler Summary */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-saas">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">AI Crawler Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {allCrawlerIds.map((id) => {
            const allowed = data.crawlers.includes(id) && data.allowAccess;
            return (
              <div key={id} className="flex items-center gap-2 text-sm">
                {allowed ? (
                  <Shield className="h-4 w-4 text-success flex-shrink-0" />
                ) : (
                  <ShieldX className="h-4 w-4 text-destructive flex-shrink-0" />
                )}
                <span className="text-card-foreground">
                  {CRAWLER_DISPLAY[id]}: <strong>{allowed ? "Allowed" : "Blocked"}</strong>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultSection;
