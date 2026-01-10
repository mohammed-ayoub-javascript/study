'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API } from '@/lib/api';
import {
  Book as BookIcon,
  Loader2,
  ChevronRight,
  Trash2,
  Calendar,
  FileText,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Book {
  ID: string;
  Title: string;
  Description: string;
  SubjectId: string;
  CreatedAt: string;
}

const BookDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API}/api/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBook(response.data);
      } catch (error) {
        toast.error('فشل في جلب تفاصيل الكتاب');
        router.push('/session/book');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBookDetails();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم حذف الكتاب بنجاح');
      router.push('/session/book');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );

  if (!book) return <div className="text-center text-white p-10">الكتاب غير موجود</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 z-10 relative text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span>العودة للمكتبة</span>
        </button>

        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
            <Trash2 className="w-4 h-4" /> حذف الكتاب
          </Button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-48 h-64 bg-primary/10 rounded-xl flex flex-col items-center justify-center border border-primary/20 shadow-2xl shadow-primary/5">
            <BookIcon className="w-20 h-20 text-primary mb-4" />
            <span className="text-xs text-primary/60 font-mono uppercase tracking-widest">
              Digital Resource
            </span>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 leading-tight">{book.Title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  أضيف في {new Date(book.CreatedAt).toLocaleDateString('ar-DZ')}
                </span>
                <span
                  className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => router.push(`/session/subjects/${book.SubjectId}`)}
                >
                  <Tag className="w-4 h-4 text-primary" />
                  رابط المادة الدراسية
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                وصف الكتاب
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg bg-white/5 p-4 rounded-lg border border-white/5">
                {book.Description || 'لا يوجد وصف مضاف لهذا الكتاب حالياً.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="p-6 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all"
          onClick={() => router.push(`/session/subjects/${book.SubjectId}`)}
        >
          <div>
            <p className="text-sm text-gray-500">مُرتبط بمادة</p>
            <p className="text-lg font-medium">عرض تفاصيل المادة كاملة</p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
