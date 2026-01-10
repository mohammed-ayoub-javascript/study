'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

export default function FAQs() {
  const faqItems = [
    {
      id: 'item-1',
      question: 'هل منصة EndLine مجانية؟',
      answer:
        'نعم، المنصة مجانية بالكامل ومفتوحة المصدر؛ فهدفنا الأساسي هو دعم الطلاب ونشر المعرفة دون أي قيود مادية.',
    },
    {
      id: 'item-2',
      question: 'ما هي منصة EndLine؟',
      answer:
        'هي مبادرة عربية تهدف لخلق بيئة دراسية مثالية عبر عزل المشتتات في يوتيوب. بدأت كأداة شخصية لحل مشكلة التركيز، وقررنا مشاركتها لتكون عملاً نافعاً وخالصاً لوجه الله لكل طالب علم.',
    },
    {
      id: 'item-3',
      question: 'كيف يمكنني المساهمة في EndLine؟',
      answer:
        'يمكنك المساهمة برمجياً عبر مستودعنا في GitHub، أو دعم استمرارية المنصة وتغطية تكاليف السيرفرات من خلال التبرع. كما يمكنك المساهمة بنشر المنصة بين زملائك؛ فالدال على الخير كفاعله.',
    },
    {
      id: 'item-4',
      question: 'كيف تحمي المنصة خصوصيتي؟',
      answer:
        'نحن لا نقوم ببيع بياناتك أو تتبع نشاطك لأغراض إعلانية؛ فالمنصة صُممت لتكون بيئة آمنة للتركيز فقط، والبيانات تُستخدم محلياً لتحسين تجربة دراستك.',
    },
    {
      id: 'item-5',
      question: 'هل يمكنني استخدام المنصة على الهاتف؟',
      answer:
        'نعم، المنصة مبنية بتقنيات حديثة تجعلها متوافقة تماماً مع جميع الشاشات، سواء كنت تدرس من الحاسوب أو التابلت أو الهاتف.',
    },
    {
      id: 'item-6',
      question: 'ما هي تقنية "بومودورو" المتوفرة في الموقع؟',
      answer:
        'هي تقنية لإدارة الوقت تعتمد على تقسيم العمل إلى فترات زمنية (غالباً 25 دقيقة) تليها استراحة قصيرة، مما يساعد على الحفاظ على أعلى مستويات التركيز ومنع الإرهاق.',
    },
    {
      id: 'item-7',
      question: 'هل أحتاج لحساب لاستخدام المنصة؟',
      answer: 'إنشاء حساب يتيح لك حفظ مهامك، ومتابعة سجل إنجازاتك، وتخصيص تجربتك بشكل أفضل.',
    },
    {
      id: 'item-8',
      question: 'لماذا اختفت التعليقات والمقترحات عند مشاهدة الفيديو؟',
      answer:
        'هذه هي الميزة الأساسية لـ EndLine؛ حيث نقوم بعزل الفيديو التعليمي عن أي مشتتات جانبية لضمان عدم خروجك عن مسار التعلم الذي بدأته.',
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
            الاسئلة الشائعة
          </h2>
          <p className="text-muted-foreground mt-4 text-balance">تعرف بشكل سريع عن منصة endline</p>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <Accordion
            type="single"
            collapsible
            className="bg-muted dark:bg-muted/50 w-full rounded-2xl p-1"
          >
            {faqItems.map((item) => (
              <div className="group" key={item.id}>
                <AccordionItem
                  value={item.id}
                  className="data-[state=open]:bg-card dark:data-[state=open]:bg-muted peer rounded-xl border-none px-7 py-1 data-[state=open]:border-none data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="cursor-pointer text-base hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-base">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
                <hr className="mx-7 border-dashed group-last:hidden peer-data-[state=open]:opacity-0" />
              </div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
