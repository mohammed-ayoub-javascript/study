/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { API } from '@/lib/api';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  Title: z
    .string()
    .min(2, {
      message: 'عنوان المادة يجب أن يتكون من حرفين على الأقل.',
    })
    .max(50, {
      message: 'العنوان طويل جداً.',
    }),
});

const NewSubject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const route = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Title: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${API}/api/subjects`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        toast.success('تمت العملية بنجاح');
        form.reset();

        route.push('/session/subjects');
      }
    } catch (error) {
      toast.error('خطأ في الإضافة');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center flex-col mt-[300px] w-full">
      <div className="w-[70%] md:w-1/2 lg:w-1/3 mx-auto p-6   backdrop-blur-sm rounded-lg shadow-sm border z-50 relative">
        <div className="flex items-center gap-2 mb-6">
          <PlusCircle className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">إضافة مادة جديدة</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="Title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المادة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: رياضيات، برمجة..." disabled={isLoading} {...field} />
                  </FormControl>
                  <FormDescription>أدخل اسم المادة التي تود متابعتها.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'إضافة المادة'
              )}
            </Button>

            <div
              onClick={() => {
                route.back();
              }}
            >
              رجوع
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewSubject;
