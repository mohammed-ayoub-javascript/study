/* eslint-disable react-hooks/purity */
'use client';
import { cn } from '@/lib/utils';
import { BentoGrid, BentoGridItem } from '../ui/bento-grid';

import { Brain, MessageCircle, TimerIcon } from 'lucide-react';

export function BentoGridThird() {
  return (
    <BentoGrid className="max-w-4xl mt-5 mx-auto p-4 md:p-1 lg:p-0">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={null}
          className={cn('[&>p:text-lg]', item.className)}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}

const items = [
  {
    title: 'بيئة عمل خالية من المشتتات',
    description: (
      <span className="text-sm">
        نحجب عنك اقتراحات يوتيوب والتعليقات لنضمن لك أعلى مستويات التركيز العميق.
      </span>
    ),
    header: null,
    className: 'md:col-span-1 h-full',
    icon: <Brain className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'تقنية بومودورو الذكية',
    description: (
      <span className="text-sm">
        نظام إدارة وقت متكامل يساعدك على تقسيم مهامك إلى فترات إنتاجية مركزة مع فترات راحة مثالية.
      </span>
    ),
    header: null,
    className: 'h-full',
    icon: <TimerIcon className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: 'رسائل تحفيزية مخصصة',
    description: (
      <span className="text-sm">
        حافظ على شغفك واتصالك بهدفك؛ يرسل لك التطبيق تذكيرات ذكية تعيد توجيه تركيزك نحو إنجازك
        القادم.
      </span>
    ),
    header: null,
    className: 'md:col-span-1',
    icon: <MessageCircle className="h-4 w-4 text-neutral-500" />,
  },
];
