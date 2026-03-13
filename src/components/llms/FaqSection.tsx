import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "LLMs.txt Generator là gì?",
    a: "Là công cụ tự động tạo file llms.txt bằng cách quét sitemap website của bạn, giúp các AI crawler hiểu và trích dẫn nội dung website tốt hơn.",
  },
  {
    q: "Upload file llms.txt ở đâu?",
    a: "Upload file vào thư mục gốc của website, ví dụ: example.com/llms.txt.",
  },
  {
    q: "Tại sao website cần file llms.txt?",
    a: "File llms.txt giúp các AI search engine như ChatGPT, Perplexity, Claude xác định các trang quan trọng, từ đó tăng khả năng hiển thị trong câu trả lời AI.",
  },
  {
    q: "Tool này có miễn phí không?",
    a: "Có. Tool hoàn toàn miễn phí và không cần đăng ký tài khoản.",
  },
  {
    q: "Tool quét website như thế nào?",
    a: "Tool tự động tìm và phân tích sitemap.xml của website, thu thập tất cả URL và phân loại thành các nhóm Docs và Optional dựa trên cấu trúc đường dẫn.",
  },
];

const FaqSection = () => (
  <section className="py-16 md:py-24">
    <div className="container max-w-3xl">
      <h2 className="text-3xl font-bold text-foreground text-center mb-12">
        Câu hỏi thường gặp
      </h2>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6 bg-card shadow-saas">
            <AccordionTrigger className="text-left font-medium text-card-foreground hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FaqSection;
