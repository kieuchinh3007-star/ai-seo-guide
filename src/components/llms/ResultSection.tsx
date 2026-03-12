import { useState } from "react";
import { Copy, Download, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { GeneratorData } from "./GeneratorTool";

interface ResultSectionProps {
  data: GeneratorData;
  onRegenerate: () => void;
}

function generateLlmsTxt(data: GeneratorData): string {
  const lines: string[] = [];
  const name = data.websiteName || new URL(data.websiteUrl).hostname;
  lines.push(`# ${name}`);
  lines.push("");

  if (data.websiteDescription) {
    lines.push(`> ${data.websiteDescription}`);
    lines.push("");
  }

  const pages = data.importantPages
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  if (pages.length > 0) {
    lines.push("## Docs");
    lines.push("");
    pages.forEach((p) => {
      try {
        const url = new URL(p);
        const pageName = url.pathname.split("/").filter(Boolean).pop() || url.hostname;
        const displayName = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/[-_]/g, " ");
        lines.push(`- [${displayName}](${p})`);
      } catch {
        lines.push(`- ${p}`);
      }
    });
    lines.push("");
  }

  if (data.sitemapUrl) {
    lines.push("## Optional");
    lines.push("");
    lines.push(`- [Sitemap](${data.sitemapUrl}): XML sitemap for crawling reference`);
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
    </div>
  );
};

export default ResultSection;
