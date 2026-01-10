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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API } from '@/lib/api';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  title: z.string().min(2, 'العنوان يجب أن يكون أكثر من حرفين'),
  description: z.string().optional(),
  videoUrl: z.string().url('يرجى إدخال رابط فيديو صحيح'),
  note: z.string().optional(),
  SubjectId: z.string().min(1, 'يرجى اختيار مادة'), 
  points: z.number().min(0).default(0),
});

const SessionNew = () => {
  const route = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      route.push("/");
      return;
    }

    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${API}/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(response.data || []);
      } catch (error) {
        toast.error("فشل في تحميل المواد");
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [route]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      videoUrl: '',
      note: '',
      SubjectId: '',
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

      if (response.status === 201 || response.status === 200) {
        toast.success('تمت الإضافة بنجاح!');
        form.reset();
        route.back();
      }
    } catch (error) {
      toast.error('خطأ في الاتصال أو البيانات');
    }
  }

  return (
    <div className="min-h-screen w-full relative">
      <div className="flex justify-center items-center w-full flex-col relative z-50">
        <Card className="w-full max-w-2xl flex flex-col mt-10 bg-transparent border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">إضافة حصة دراسية جديدة</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-white">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العنوان (Title)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: فيزياء - الوحدة الأولى" {...field} className="bg-white/5 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="SubjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المادة الدراسية</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder={loadingSubjects ? "جاري التحميل..." : "اختر المادة"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          {subjects.length > 0 ? (
                            subjects.map((s) => (
                              <SelectItem key={s.ID} value={s.ID}>
                                {s.Title}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-gray-500 text-center">لا توجد مواد مضافة</div>
                          )}
                        </SelectContent>
                      </Select>
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
                        <Input placeholder="https://youtube.com/..." {...field} className="bg-white/5 border-white/10" />
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
                        <Textarea placeholder="ماذا ستتعلم في هذه الحصة؟" {...field} className="bg-white/5 border-white/10" />
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
                        <Textarea placeholder="أي ملاحظات تود تذكرها لاحقاً" {...field} className="bg-white/5 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 transition-colors" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Plus className="ml-2" />}
                  إضافة الحصة
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