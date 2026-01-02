/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trash2, BookOpen, ChevronRight } from 'lucide-react';
import Header from '@/components/global/header';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API } from '@/lib/api';

interface Session {
  ID: string;
  Title: string;
  Description: string;
  Subject: string;
  Points: number;
  Status: string;
  CreatedAt: string;
}

const AllSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const route = useRouter();
  const fetchSessions = (token: string) => {
    fetch(`${API}/api/sessions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status == 401) {
          localStorage.removeItem('token');
          route.push('/auth');
        }
        return res.json();
      })
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');

    if (!token) {
      route.push('/auth');
    } else {
      setHasToken(true);
      fetchSessions(token);
    }
  }, [route]);

  const groupedSessions = sessions.reduce((acc: any, session) => {
    const subject = session.Subject || 'عام';
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(session);
    return acc;
  }, {});

  const subjects = Object.keys(groupedSessions);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">مكتمل</Badge>;
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            غير مكتمل
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  if (!isMounted) {
    return <div className="min-h-screen bg-black" />;
  }
  if (!hasToken) {
    return <div className="p-10 text-center text-white">جاري التحقق من الحساب...</div>;
  }
  if (loading) return <div className="p-10 text-center">جاري ترتيب المواد...</div>;

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
      <div className="min-h-screen bg-black/5 relative z-50">
        <Header />
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <BookOpen /> الحصص الدراسية
          </h1>

          {!selectedSubject ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card
                  key={subject}
                  className=" cursor-pointer transition-all hover:shadow-xl group"
                  onClick={() => setSelectedSubject(subject)}
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {subject}
                      <ChevronRight className="group-hover:translate-x-[-5px] transition-transform" />
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      عدد الحصص: {groupedSessions[subject].length}
                    </p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-lg animate-in fade-in slide-in-from-bottom-4">
              <CardHeader className="flex flex-row items-center justify-between border-b mb-4">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setSelectedSubject(null)}>
                    رجوع للمواد
                  </Button>
                  <CardTitle className="text-2xl font-bold">مادة: {selectedSubject}</CardTitle>
                </div>
                <Badge variant="secondary">
                  إجمالي النقاط:{' '}
                  {groupedSessions[selectedSubject].reduce((a: any, b: any) => a + b.Points, 0)}
                </Badge>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">العنوان</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedSessions[selectedSubject].map((session: Session) => (
                      <TableRow key={session.ID}>
                        <TableCell className="font-medium">{session.Title}</TableCell>
                        <TableCell>{getStatusBadge(session.Status)}</TableCell>
                        <TableCell className="flex justify-center gap-2">
                          <a href={`/session/watch/${session.ID}`}>
                            <Button variant="outline" size="sm" className="">
                              <PlayCircle className="w-4 h-4 ml-1" /> شاهد الآن
                            </Button>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllSessions;
