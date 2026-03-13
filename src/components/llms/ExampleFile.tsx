const EXAMPLE = `# Acme Corp

> Acme Corp is an analytics platform that tracks website performance, SEO rankings, and AI search visibility.

## Docs

- [Quick Start Guide](https://acme.com/docs/quickstart): Get started with Acme Corp in 5 minutes
- [API Reference](https://acme.com/docs/api): Complete REST API documentation
- [Blog](https://acme.com/blog): Latest updates, tutorials, and insights

## Optional

- [Sitemap](https://acme.com/sitemap.xml)
- [Changelog](https://acme.com/changelog)`;

const ExampleFile = () => (
  <section className="py-16 md:py-24">
    <div className="container max-w-4xl">
      <h2 className="text-3xl font-bold text-foreground text-center mb-4">
        Example LLMs.txt File
      </h2>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        The llms.txt file helps AI models quickly identify the most important content on your website.
      </p>

      <div className="rounded-xl overflow-hidden shadow-saas-lg">
        <pre className="bg-code text-code-foreground p-6 overflow-x-auto text-sm leading-relaxed font-mono">
          {EXAMPLE}
        </pre>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center">
        The llms.txt file acts as a machine-readable guide telling AI systems which pages matter and how to use the content.
      </p>
    </div>
  </section>
);

export default ExampleFile;
