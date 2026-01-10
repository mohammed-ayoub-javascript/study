/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Map as MapIcon, ChevronLeft, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { API } from '@/lib/api';

interface Book {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  created_at: string;
}

const Maps = () => {
  const [maps, setMaps] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserMaps = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(`${API}/api/books`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setMaps(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'فشل في جلب الخرائط الدراسية');
      } finally {
        setLoading(false);
      }
    };

    fetchUserMaps();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
        <p className="text-stone-400 animate-pulse text-sm font-medium">جاري مزامنة خرائطك...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="bg-red-950/20 border-red-900 text-red-400 max-w-md mx-auto"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ في النظام</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">خرائطك الدراسية</h2>
        <span className="bg-stone-800 text-orange-500 text-xs px-2 py-1 rounded-full border border-stone-700">
          {maps.length} مسارات
        </span>
      </div>

      <div className="grid gap-4">
        {maps.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed border-stone-800 rounded-3xl">
            <MapIcon className="w-12 h-12 text-stone-700 mx-auto mb-4" />
            <p className="text-stone-500">لا توجد خرائط حالياً. ابدأ بإنشاء أول مسار نجاح!</p>
          </div>
        ) : (
          maps.map((map) => (
            <Card
              key={map.id}
              className="bg-stone-900 border-stone-800 hover:border-orange-900/50 transition-all cursor-pointer group shadow-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-white group-hover:text-orange-500 transition-colors">
                    {map.title}
                  </CardTitle>
                  <CardDescription className="text-stone-500 text-xs line-clamp-1">
                    {map.description}
                  </CardDescription>
                </div>
                <ChevronLeft className="w-5 h-5 text-stone-600 group-hover:text-orange-500 transition-all transform group-hover:-translate-x-1" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 flex-1 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-700 w-[60%] shadow-[0_0_8px_rgba(194,65,12,0.5)]" />
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">60%</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Maps;
