/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, BookOpen, ChevronRight, LayoutGrid, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API } from '@/lib/api';

interface Session {
  ID: string;
  Title: string;
  SubjectId: string;
  Status: string;
  Points: number;
}

interface Subject {
  ID: string;
  Title: string;
}

const AllSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [subjectsRes, sessionsRes] = await Promise.all([
        axios.get(`${API}/api/subjects`, { headers }),
        axios.get(`${API}/api/sessions`, { headers }),
      ]);

      setSubjectsList(subjectsRes.data || []);
      setSessions(sessionsRes.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedSessions = subjectsList.reduce((acc: any, subj) => {
    acc[subj.ID] = {
      title: subj.Title,
      items: sessions.filter((s) => s.SubjectId === subj.ID),
    };
    return acc;
  }, {});

  const unassignedSessions = sessions.filter(
    (s) => !s.SubjectId || !subjectsList.some((subj) => subj.ID === s.SubjectId)
  );

  if (unassignedSessions.length > 0) {
    groupedSessions['unassigned'] = {
      title: 'حصص غير مصنفة',
      items: unassignedSessions,
    };
  }

  const subjectIds = Object.keys(groupedSessions);

  const getStatusBadge = (status: string) => {
    return status === 'completed' ? (
      <Badge className="bg-green-500/20 text-green-500 border-green-500/50">مكتمل</Badge>
    ) : (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
        غير مكتمل
      </Badge>
    );
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">جاري ترتيب المكتبة...</p>
      </div>
    );

  return (
    <div className="min-h-screen w-full relative">
      <div className="container mx-auto p-6">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutGrid className="text-primary" /> مكتبة الحصص
          </h1>
          {selectedSubjectId && (
            <Button variant="outline" onClick={() => setSelectedSubjectId(null)}>
              عرض كل المواد
            </Button>
          )}
        </header>

        {!selectedSubjectId ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectIds.map((id) => (
              <Card
                key={id}
                className="cursor-pointer hover:border-primary/50 transition-all hover:bg-primary/[0.02] group relative overflow-hidden"
                onClick={() => setSelectedSubjectId(id)}
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen size={60} />
                </div>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-xl">
                    {groupedSessions[id].title}
                    <ChevronRight className="group-hover:translate-x-1 transition-transform text-primary" />
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="font-mono">
                      {groupedSessions[id].items.length} حصص
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <Card className="border-primary/10 bg-black/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
                <div>
                  <p className="text-primary text-sm font-medium mb-1">تصفح مادة</p>
                  <CardTitle className="text-3xl font-bold">
                    {groupedSessions[selectedSubjectId].title}
                  </CardTitle>
                </div>
                <div className="text-left">
                  <p className="text-muted-foreground text-xs uppercase">إجمالي النقاط</p>
                  <p className="text-2xl font-mono font-bold text-orange-500">
                    {groupedSessions[selectedSubjectId].items.reduce(
                      (a: number, b: any) => a + (b.Points || 0),
                      0
                    )}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {groupedSessions[selectedSubjectId].items.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground italic">
                    لا توجد حصص مضافة لهذه المادة بعد.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="text-right">عنوان الحصة</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-center">الإجراء</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedSessions[selectedSubjectId].items.map((session: Session) => (
                        <TableRow key={session.ID} className="border-white/5 hover:bg-white/[0.02]">
                          <TableCell className="font-medium py-4 max-w-md truncate">
                            {session.Title}
                          </TableCell>
                          <TableCell>{getStatusBadge(session.Status)}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-primary hover:text-white"
                              onClick={() => router.push(`/session/watch/${session.ID}`)}
                            >
                              <PlayCircle className="w-4 h-4 ml-2" /> تشغيل
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSessions;
