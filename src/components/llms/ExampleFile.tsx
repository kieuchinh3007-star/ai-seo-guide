const EXAMPLE = `# Acme Corp

> Acme Corp là nền tảng phân tích hiệu suất website, theo dõi thứ hạng SEO và khả năng hiển thị trên AI search.

## Docs

- [Hướng dẫn bắt đầu](https://acme.com/docs/quickstart): Bắt đầu sử dụng Acme Corp trong 5 phút
- [Tài liệu API](https://acme.com/docs/api): Tài liệu REST API đầy đủ
- [Blog](https://acme.com/blog): Cập nhật mới nhất, hướng dẫn và phân tích

## Optional

- [Sitemap](https://acme.com/sitemap.xml)
- [Changelog](https://acme.com/changelog)`;

const ExampleFile = () => (
  <section className="py-16 md:py-24">
    <div className="container max-w-4xl">
      <h2 className="text-3xl font-bold text-foreground text-center mb-4">
        Ví dụ file LLMs.txt
      </h2>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        File llms.txt giúp AI nhanh chóng xác định nội dung quan trọng trên website của bạn.
      </p>

      <div className="rounded-xl overflow-hidden shadow-saas-lg">
        <pre className="bg-code text-code-foreground p-6 overflow-x-auto text-sm leading-relaxed font-mono">
          {EXAMPLE}
        </pre>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center">
        File llms.txt hoạt động như một bản hướng dẫn giúp AI biết trang nào quan trọng và cách sử dụng nội dung.
      </p>
    </div>
  </section>
);

export default ExampleFile;
