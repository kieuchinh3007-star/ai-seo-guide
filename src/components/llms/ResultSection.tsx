import { useState } from "react";
import { Copy, Download, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { CrawlResult } from "./GeneratorTool";

interface ResultSectionProps {
  data: CrawlResult;
  onRegenerate: () => void;
}

function generateLlmsTxt(data: CrawlResult): string {
  const lines: string[] = [];

  // # Title
  lines.push(`# ${data.siteName}`);
  lines.push("");

  // > Description
  if (data.description) {
    lines.push(`> ${data.description}`);
    lines.push("");
  }

  // Categorize pages
  const docs: typeof data.pages = [];
  const optional: typeof data.pages = [];

  data.pages.forEach((page) => {
    const path = (() => {
      try { return new URL(page.url).pathname.toLowerCase(); } catch { return ""; }
    })();

    if (
      path === "/" ||
      path.includes("/doc") ||
      path.includes("/guide") ||
      path.includes("/tutorial") ||
      path.includes("/api") ||
      path.includes("/blog") ||
      path.includes("/about") ||
      path.includes("/feature") ||
      path.includes("/pricing")
    ) {
      docs.push(page);
    } else {
      optional.push(page);
    }
  });

  // If no docs categorized, put first 20 as docs
  if (docs.length === 0) {
    docs.push(...data.pages.slice(0, 20));
  } else if (optional.length === 0 && docs.length > 20) {
    optional.push(...docs.splice(20));
  }

  if (docs.length > 0) {
    lines.push("## Docs");
    lines.push("");
    docs.forEach((p) => {
      lines.push(`- [${p.title}](${p.url})`);
    });
    lines.push("");
  }

  if (optional.length > 0) {
    lines.push("## Optional");
    lines.push("");
    optional.forEach((p) => {
      lines.push(`- [${p.title}](${p.url})`);
    });
    lines.push("");
  }

  // Always add sitemap
  lines.push(`- [Sitemap](${data.websiteUrl}/sitemap.xml)`);
  lines.push("");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Kết quả file llms.txt
        </h2>
        <span className="text-sm text-muted-foreground">
          Đã quét {data.pages.length} trang
        </span>
      </div>

      <div className="rounded-xl overflow-hidden shadow-saas-lg">
        <pre className="bg-code text-code-foreground p-6 overflow-x-auto text-sm leading-relaxed font-mono max-h-[500px] overflow-y-auto">
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
          <RefreshCw className="h-4 w-4" /> Quét lại
        </Button>
      </div>
    </div>
  );
};

export default ResultSection;
