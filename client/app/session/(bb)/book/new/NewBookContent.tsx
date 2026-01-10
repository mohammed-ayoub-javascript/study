/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import axios from 'axios';
import { Loader2, BookPlus, BookType, PlusCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

const bookSchema = z.object({
  Title: z.string().min(2, 'العنوان قصير جداً'),
  SubjectId: z.string().min(1, 'يرجى اختيار المادة'),
});

const NewBookContent = () => {
  const [subjects, setSubjects] = useState<{ ID: string; Title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const searchParams = useSearchParams();
  const [quickSubjectTitle, setQuickSubjectTitle] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const subjectIdFromUrl = searchParams.get('subject');
  const route = useRouter();

  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      Title: '',
      SubjectId: subjectIdFromUrl || '',
    },
  });

  useEffect(() => {
    if (subjectIdFromUrl) {
      form.setValue('SubjectId', subjectIdFromUrl);
    }
  }, [subjectIdFromUrl, form]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(response.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('خطأ في جلب المواد');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleQuickSubjectAdd = async () => {
    if (!quickSubjectTitle.trim()) {
      toast.error('يرجى إدخال اسم المادة');
      return;
    }

    setIsAddingSubject(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API}/api/subjects`,
        { Title: quickSubjectTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('تمت إضافة المادة بنجاح');
      setSubjects([...subjects, res.data]);
      form.setValue('SubjectId', res.data.ID);
      setQuickSubjectTitle('');
    } catch (error) {
      console.error('Error adding subject:', error);
      toast.error('فشل في إضافة المادة');
    } finally {
      setIsAddingSubject(false);
    }
  };

  async function onSubmit(values: z.infer<typeof bookSchema>) {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/api/books`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تمت إضافة الكتاب بنجاح');
      form.reset();
      route.push('/session/book');
    } catch (error: any) {
      console.error('Error adding book:', error);
      toast.error(error.response?.data?.message || 'خطأ في إضافة الكتاب');
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-[80%] md:w-1/2 lg:w-1/3 mx-auto p-6 backdrop-blur-sm rounded-xl border border-white/10 relative z-10 mt-[100px]">
      {subjects.length === 0 ? (
        <div className="space-y-6 py-4 text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-amber-500/10 rounded-full">
              <AlertCircle className="w-12 h-12 text-amber-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">لا توجد مواد دراسية بعد!</h2>
            <p className="text-gray-400 text-sm">
              يجب عليك إنشاء مادة أولاً لتتمكن من إضافة الكتب إليها.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <Input
              placeholder="اسم المادة الجديدة (مثل: فيزياء)"
              value={quickSubjectTitle}
              onChange={(e) => setQuickSubjectTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleQuickSubjectAdd();
                }
              }}
              className="bg-white/5 border-white/20 h-12 text-center"
              dir="rtl"
            />
            <Button
              onClick={handleQuickSubjectAdd}
              disabled={isAddingSubject || !quickSubjectTitle.trim()}
              className="h-12 gap-2"
              variant="default"
            >
              {isAddingSubject ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              إنشاء مادة والبدء بإضافة كتب
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-8">
            <BookPlus className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-white">إضافة كتاب جديد</h2>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="Title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">عنوان الكتاب</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <BookType className="absolute right-3 top-3 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="اسم الكتاب..."
                          className="pr-10 bg-white/5 border-white/10 text-white"
                          dir="rtl"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="SubjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">اختر المادة</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/10 w-full text-white">
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-white/10 text-white bg-gray-900">
                        {subjects.map((subject) => (
                          <SelectItem
                            key={subject.ID}
                            value={subject.ID}
                            className="hover:bg-gray-800"
                          >
                            {subject.Title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400 text-sm" />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => route.push('/session/book')}
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
                <Button type="submit" className="flex-1 h-12" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ الكتاب'
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">إضافة مادة جديدة سريعاً</h3>
            <div className="flex gap-2">
              <Input
                placeholder="اسم المادة الجديدة"
                value={quickSubjectTitle}
                onChange={(e) => setQuickSubjectTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickSubjectAdd();
                  }
                }}
                className="flex-1 bg-white/5 border-white/20"
                dir="rtl"
              />
              <Button
                onClick={handleQuickSubjectAdd}
                disabled={isAddingSubject || !quickSubjectTitle.trim()}
                variant="secondary"
                className="whitespace-nowrap"
              >
                {isAddingSubject ? <Loader2 className="animate-spin w-4 h-4" /> : 'إضافة مادة'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NewBookContent;
