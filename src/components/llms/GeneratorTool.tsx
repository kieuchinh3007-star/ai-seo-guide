import { useState } from "react";
import { Globe, Info, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface GeneratorData {
  websiteUrl: string;
  websiteName: string;
  websiteDescription: string;
  sitemapUrl: string;
  allowAccess: boolean;
  allowTraining: boolean;
  allowCitation: boolean;
  allowIndexing: boolean;
  crawlers: string[];
  importantPages: string;
}

interface GeneratorToolProps {
  onGenerate: (data: GeneratorData) => void;
}

const CRAWLERS = [
  { id: "gptbot", label: "ChatGPT (GPTBot)" },
  { id: "claudebot", label: "ClaudeBot" },
  { id: "perplexitybot", label: "PerplexityBot" },
  { id: "google-extended", label: "Google-Extended" },
  { id: "common", label: "Common AI Crawlers" },
];

const GeneratorTool = ({ onGenerate }: GeneratorToolProps) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [data, setData] = useState<GeneratorData>({
    websiteUrl: "",
    websiteName: "",
    websiteDescription: "",
    sitemapUrl: "",
    allowAccess: true,
    allowTraining: false,
    allowCitation: true,
    allowIndexing: true,
    crawlers: ["gptbot", "claudebot", "perplexitybot"],
    importantPages: "",
  });
  const [urlError, setUrlError] = useState("");

  const updateData = (key: keyof GeneratorData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCrawler = (id: string) => {
    setData((prev) => ({
      ...prev,
      crawlers: prev.crawlers.includes(id)
        ? prev.crawlers.filter((c) => c !== id)
        : [...prev.crawlers, id],
    }));
  };

  const validateUrl = (url: string) => {
    if (!url) return "Please enter a valid website URL";
    try {
      new URL(url);
      return "";
    } catch {
      return "Please enter a valid website URL";
    }
  };

  const handleNext = () => {
    if (step === 1) {
      const err = validateUrl(data.websiteUrl);
      if (err) {
        setUrlError(err);
        return;
      }
      setUrlError("");
    }
    if (step < 3) setStep(step + 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setLoadingText("Analyzing website structure...");
    await new Promise((r) => setTimeout(r, 1000));
    setLoadingText("Generating file...");
    await new Promise((r) => setTimeout(r, 800));
    setIsGenerating(false);
    setLoadingText("");
    onGenerate(data);
  };

  const progress = (step / 3) * 100;

  return (
    <div className="rounded-xl border border-border bg-card shadow-saas-lg p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-card-foreground">LLMs.txt Generator</h2>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {step} / 3</span>
          <span>{step === 1 ? "Website Info" : step === 2 ? "AI Crawler Rules" : "Generate"}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <h3 className="text-lg font-medium text-card-foreground">Website Information</h3>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-card-foreground">Website URL <span className="text-destructive">*</span></Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={data.websiteUrl}
              onChange={(e) => { updateData("websiteUrl", e.target.value); setUrlError(""); }}
              className={urlError ? "border-destructive" : ""}
            />
            {urlError && <p className="text-sm text-destructive flex items-center gap-1">⚠ {urlError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-card-foreground">Website Name</Label>
            <Input id="name" placeholder="Letsmetrix" value={data.websiteName} onChange={(e) => updateData("websiteName", e.target.value)} />
            <p className="text-xs text-muted-foreground">Optional.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="desc" className="text-card-foreground">Website Description</Label>
              <Tooltip>
                <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                <TooltipContent>Helps AI systems understand your site purpose</TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="desc"
              placeholder="Analytics platform that tracks AI search traffic from ChatGPT, Perplexity and other LLM platforms."
              value={data.websiteDescription}
              onChange={(e) => updateData("websiteDescription", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sitemap" className="text-card-foreground">Sitemap URL</Label>
            <Input id="sitemap" placeholder="https://example.com/sitemap.xml" value={data.sitemapUrl} onChange={(e) => updateData("sitemapUrl", e.target.value)} />
            <p className="text-xs text-muted-foreground">Optional.</p>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-5">
          <h3 className="text-lg font-medium text-card-foreground">AI Crawler Rules</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-medium text-card-foreground">Permissions</span>
              <Tooltip>
                <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                <TooltipContent>Define how AI models can use your content</TooltipContent>
              </Tooltip>
            </div>
            {[
              { key: "allowAccess" as const, label: "Allow AI crawlers to access content" },
              { key: "allowTraining" as const, label: "Allow training usage" },
              { key: "allowCitation" as const, label: "Allow citation in AI answers" },
              { key: "allowIndexing" as const, label: "Allow indexing by AI search engines" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <Checkbox id={key} checked={data[key]} onCheckedChange={(v) => updateData(key, !!v)} />
                <Label htmlFor={key} className="text-sm text-card-foreground cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-card-foreground">Select Supported AI Crawlers</span>
            {CRAWLERS.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <Checkbox id={c.id} checked={data.crawlers.includes(c.id)} onCheckedChange={() => toggleCrawler(c.id)} />
                <Label htmlFor={c.id} className="text-sm text-card-foreground cursor-pointer">{c.label}</Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="pages" className="text-card-foreground">Important Pages</Label>
              <Tooltip>
                <TooltipTrigger asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></TooltipTrigger>
                <TooltipContent>Pages AI should prioritize</TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="pages"
              placeholder={"https://example.com/blog\nhttps://example.com/docs\nhttps://example.com/pricing"}
              value={data.importantPages}
              onChange={(e) => updateData("importantPages", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-5 text-center">
          <h3 className="text-lg font-medium text-card-foreground">Generate Your File</h3>
          <p className="text-muted-foreground">
            Review your settings and generate your llms.txt file.
          </p>

          <div className="text-left bg-muted/50 rounded-lg p-4 text-sm space-y-1 text-card-foreground">
            <p><strong>URL:</strong> {data.websiteUrl}</p>
            {data.websiteName && <p><strong>Name:</strong> {data.websiteName}</p>}
            <p><strong>Crawlers:</strong> {data.crawlers.length} selected</p>
            <p><strong>Access:</strong> {data.allowAccess ? "Allowed" : "Blocked"}</p>
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">{loadingText}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isGenerating}>Back</Button>
        ) : (
          <div />
        )}
        {step < 3 ? (
          <Button onClick={handleNext} className="gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={isGenerating} className="gap-1">
            {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : "Generate llms.txt"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GeneratorTool;
