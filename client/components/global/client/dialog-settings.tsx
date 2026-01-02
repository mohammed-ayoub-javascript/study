/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Settings2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const DB_NAME = 'PomodoroDB';
const STORE_NAME = 'settings';

const SettingsDialog = () => {
  const [pomoTime, setPomoTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [shortMsgs, setShortMsgs] = useState<string[]>([]);
  const [milestoneMsgs, setMilestoneMsgs] = useState<string[]>([]);
  const [newMsg, setNewMsg] = useState('');

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const loadData = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const data = request.result;
        data.forEach((item) => {
          if (item.id === 'pomoTime') setPomoTime(item.value);
          if (item.id === 'breakTime') setBreakTime(item.value);
          if (item.id === 'shortMsgs') setShortMsgs(item.value);
          if (item.id === 'milestoneMsgs') setMilestoneMsgs(item.value);
        });
      };
    } catch (err) {
      console.error('Failed to load IndexedDB data', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSettings = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const settings = [
        { id: 'pomoTime', value: pomoTime },
        { id: 'breakTime', value: breakTime },
        { id: 'shortMsgs', value: shortMsgs },
        { id: 'milestoneMsgs', value: milestoneMsgs },
      ];

      settings.forEach((item) => store.put(item));

      transaction.oncomplete = () => toast.success('تم الحفظ بنجاح! ');
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const addMsg = (type: 'short' | 'milestone') => {
    if (!newMsg.trim()) return;
    if (type === 'short') setShortMsgs([...shortMsgs, newMsg]);
    else setMilestoneMsgs([...milestoneMsgs, newMsg]);
    setNewMsg('');
  };

  const removeMsg = (index: number, type: 'short' | 'milestone') => {
    if (type === 'short') setShortMsgs(shortMsgs.filter((_, i) => i !== index));
    else setMilestoneMsgs(milestoneMsgs.filter((_, i) => i !== index));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
        >
          <Settings2 size={18} /> الإعدادات
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold ">إعدادات النظام</DialogTitle>
          <DialogDescription className="text-zinc-400">
            تحكم في أوقاتك ورسائلك المفضلة.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
            <TabsTrigger value="timer">الوقت</TabsTrigger>
            <TabsTrigger value="short">رسائل قصيرة</TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>وقت التركيز (دقيقة)</Label>
                <Input
                  type="number"
                  value={pomoTime}
                  onChange={(e) => setPomoTime(Number(e.target.value))}
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label>وقت الاستراحة (دقيقة)</Label>
                <Input
                  type="number"
                  value={breakTime}
                  onChange={(e) => setBreakTime(Number(e.target.value))}
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="short" className="py-4 space-y-4" dir="rtl">
            <div className="flex gap-2">
              <Input
                placeholder="أضف رسالة..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                className="bg-zinc-900 border-zinc-700"
              />
              <Button size="icon" onClick={() => addMsg('short')}>
                {' '}
                <Plus size={20} />{' '}
              </Button>
            </div>
            <ScrollArea dir="rtl" className="h-[200px] border border-zinc-800 rounded-md p-2">
              <AnimatePresence>
                {shortMsgs.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-between items-center p-2 mb-2 bg-zinc-900 rounded"
                  >
                    <span className="text-sm">{msg}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMsg(i, 'short')}
                      className="text-zinc-500 hover:text-red-500"
                    >
                      {' '}
                      <Trash2 size={16} />{' '}
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>
            <p>أكتب رسائل تذكرك بهدفك ستظهر لك كل فترة وانت تدرس لتحفزك على الاستمرار</p>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t border-zinc-800 mt-4">
          <Button onClick={handleSaveSettings} className="  gap-2">
            <Save size={18} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
