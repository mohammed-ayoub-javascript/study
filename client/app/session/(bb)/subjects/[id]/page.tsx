'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API } from '@/lib/api';
import {
  Book,
  Loader2,
  Trash2,
  Edit,
  BookOpen,
  ChevronRight,
  Check,
  X,
  PlusCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Subject {
  ID: string;
  Title: string;
}

interface BookItem {
  ID: string;
  Title: string;
  Description: string;
}

const ShowDetailsOfSubject = () => {
  const { id } = useParams();
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const subjectRes = await axios.get(`${API}/api/subjects/${id}`, { headers });
        setSubject(subjectRes.data);
        setNewTitle(subjectRes.data.Title);

        const booksRes = await axios.get(`${API}/api/subjects/${id}/books`, { headers });
        setBooks(booksRes.data || []);
      } catch (error) {
        toast.error('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleUpdateTitle = async () => {
    if (!newTitle.trim() || newTitle === subject?.Title) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/api/subjects/${id}`,
        { Title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubject((prev) => (prev ? { ...prev, Title: newTitle } : null));
      toast.success('تم تحديث اسم المادة');
      setIsEditing(false);
    } catch (error) {
      toast.error('فشل في تحديث الاسم');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟ سيتم حذف جميع الكتب المرتبطة بها.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('تم حذف المادة بنجاح');
      router.push('/session/subjects');
    } catch (error) {
      toast.error('فشل حذف المادة');
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 z-10 relative text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1 flex-1">
          <button
            onClick={() => router.push('/session/subjects')}
            className="text-gray-400 hover:text-white flex items-center gap-1 text-sm mb-2 transition-colors"
          >
            <ChevronRight className="w-4 h-4" /> العودة للمواد
          </button>

          {isEditing ? (
            <div className="flex items-center gap-2 max-w-md">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-white/5 border-white/20 text-xl font-bold h-12"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
              />
              <Button size="icon" onClick={handleUpdateTitle} disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 text-green-500" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setNewTitle(subject?.Title || '');
                }}
              >
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="text-primary w-8 h-8" /> {subject?.Title}
            </h1>
          )}
        </div>

        <div className="flex gap-3">
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="gap-2 border-white/10 hover:bg-white/5"
            >
              <Edit className="w-4 h-4" /> تعديل المادة
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete} className="gap-2">
            <Trash2 className="w-4 h-4" /> حذف المادة
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Book className="w-5 h-5 text-primary" /> الكتب والمراجع ({books.length})
          </h2>
          {books.length > 0 && (
            <Button
              size="sm"
              className="gap-2"
              onClick={() => router.push(`/session/book/new?subject=${subject?.ID}`)}
            >
              <PlusCircle className="w-4 h-4" /> إضافة كتاب
            </Button>
          )}
        </div>

        {books.length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-16 text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Book className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">لا توجد كتب لهذه المادة</h3>
            <p className="text-gray-400 mt-1 max-w-xs mx-auto">
              ابدأ بإضافة أول مراجعك الدراسية لهذه المادة لتنظيم مذاكرتك.
            </p>
            <Button
              onClick={() => router.push(`/session/book/new?subject=${subject?.ID}`)}
              variant="default"
              className="mt-6 gap-2"
            >
              <PlusCircle className="w-4 h-4" /> إضافة أول كتاب
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book) => (
              <div
                key={book.ID}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-white/[0.08] transition-all group cursor-pointer"
                onClick={() => router.push(`/session/book/${book.ID}`)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {book.Title}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transform transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                  {book.Description || 'لا يوجد وصف متوفر لهذا الكتاب...'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowDetailsOfSubject;
