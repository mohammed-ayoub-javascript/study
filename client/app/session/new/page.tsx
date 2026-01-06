/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/global/header';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API } from '@/lib/api';
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string().min(2, 'العنوان يجب أن يكون أكثر من حرفين'),
  description: z.string().optional(),
  videoUrl: z.string().url('يرجى إدخال رابط فيديو صحيح'),
  note: z.string().optional(),
  subject: z.string(),
  points: z.number().min(0).default(0),
});

const SessionNew = () => {
  const route = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      route.push('/auth');
    }
  }, [route]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      videoUrl: '',
      note: '',
      subject: 'عام',
      points: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/api/sessions`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status == 201) {
        toast.success('تمت الإضافة بنجاح!');
        form.reset();
        route.back();
      }
    } catch (error) {
      toast.error('خطأ في الاتصال');
    }
  }

  return (
    <div className="min-h-screen w-full relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: '#0a0a0a',
          backgroundImage: `
       radial-gradient(circle at 25% 25%, #222222 0.5px, transparent 1px),
       radial-gradient(circle at 75% 75%, #111111 0.5px, transparent 1px)
     `,
          backgroundSize: '10px 10px',
          imageRendering: 'pixelated',
        }}
      />
      <div className="flex justify-center items-center w-full flex-col  relative z-50">
        <Header />
        <Card className="w-full max-w-2xl flex  flex-col mt-10 bg-transparent ">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">إضافة حصة دراسية جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان (Title)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: فيزياء - الوحدة الأولى" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الفيديو (Video URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Textarea placeholder="ماذا ستتعلم في هذه الحصة؟" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مادة</FormLabel>
                      <FormControl>
                        <Textarea placeholder="ماهي المادة ؟" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات إضافية</FormLabel>
                      <FormControl>
                        <Textarea placeholder="أي ملاحظات تود تذكرها لاحقاً" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  <Plus />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SessionNew;
