/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TaskNode from './task.node';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const nodeTypes = { taskNode: TaskNode };

export default function StudyFlow() {
  const [nodes, setNodes] = useState<any>([]);
  const [edges, setEdges] = useState<any>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [subject, setSubject] = useState('');

  const onNodesChange = useCallback(
    (changes: NodeChange<never>[]) => setNodes((nds: any) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<never>[]) => setEdges((eds: any) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((params: any) => setEdges((eds: any) => addEdge(params, eds)), []);

  const addNewTask = () => {
    if (!taskTitle) return;

    const id = `task-${Date.now()}`;
    const newNode = {
      id,
      type: 'taskNode',
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: {
        label: taskTitle,
        subject: subject || 'عام',
        isCompleted: false,
        toggleCompleted: () => toggleTaskStatus(id),
      },
    };

    setNodes((nds: any) => nds.concat(newNode));

    setTaskTitle('');
    setSubject('');
    setIsDialogOpen(false);
  };

  const toggleTaskStatus = (id: string) => {
    setNodes((nds: any) =>
      nds.map((node: any) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, isCompleted: !node.data.isCompleted } };
        }
        return node;
      })
    );
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#1c1917' }}>
      <div className="absolute top-4 left-4 z-10">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-stone-900 border-stone-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-orange-500">تفاصيل المهمة الجديدة</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">عنوان المهمة</Label>
                <Input
                  id="title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="مثلاً: حل تمارين الميكانيك"
                  className="bg-stone-800 border-stone-700 focus:border-orange-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">المادة</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="فيزياء، فلسفة..."
                  className="bg-stone-800 border-stone-700 focus:border-orange-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addNewTask} className="bg-orange-700 hover:bg-orange-600 w-full">
                تثبيت على الخريطة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#333" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
