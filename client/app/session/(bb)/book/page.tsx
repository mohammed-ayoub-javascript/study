'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '@/lib/api';
import { Book as BookIcon, Loader2, Search, Plus, BookOpen, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface Book {
  ID: string;
  Title: string;
  Description: string;
  SubjectId: string;
}

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const route = useRouter();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/api/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(response.data || []);
    } catch (error) {
      toast.error('فشل في تحميل الكتب');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.Description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteBook = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter((b) => b.ID !== id));
      toast.success('تم حذف الكتاب');
    } catch (error) {
      toast.error('فشل الحذف');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 z-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookIcon className="text-primary w-8 h-8" />
            مكتبتي
          </h1>
          <p className="text-gray-400 mt-1">لديك {books.length} كتاب في مختلف المواد</p>
        </div>

        <Link href="/session/book/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> إضافة كتاب جديد
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="ابحث عن كتاب بالاسم أو الوصف..."
          className="bg-white/5 border-white/10 pr-10 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-medium">لا توجد كتب</h3>
          <p className="text-gray-500 text-sm">ابدأ بإضافة أول كتاب لمكتبتك الدراسية</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.ID}
              onClick={() => {
                route.push(`/session/book/book/${book.ID}`);
              }}
              className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/[0.08] transition-all relative"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookIcon className="w-5 h-5 text-primary" />
                </div>
                <button
                  onClick={() => handleDeleteBook(book.ID)}
                  className="text-gray-600 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-white font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {book.Title}
              </h3>

              <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
                {book.Description || 'لا يوجد وصف لهذا الكتاب.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <Link href={`/session/subjects/${book.SubjectId}`}>
                  <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded hover:bg-primary/20 hover:text-primary transition-all flex items-center gap-1">
                    <Filter className="w-3 h-3" /> عرض المادة
                  </span>
                </Link>
                <Link href={`/session/book/${book.ID}`}>
                  <Button variant="ghost" size="sm" className="text-xs h-8">
                    التفاصيل
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;
