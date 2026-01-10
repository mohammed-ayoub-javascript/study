/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from '@xyflow/react';

export default function TaskNode({ data }: any) {
  return (
    <div
      className={`min-w-[150px] p-3 rounded-lg border-2 transition-all ${
        data.isCompleted
          ? 'bg-emerald-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          : 'bg-stone-900 border-orange-900 shadow-lg'
      }`}
    >
      <Handle type="target" position={Position.Right} className="!bg-orange-500" />

      <div className="text-center">
        <p className="text-stone-400 text-[10px] mb-1">TASK</p>
        <h4 className="text-white font-medium text-sm">{data.label}</h4>
        <button
          onClick={data.toggleCompleted}
          className={`mt-2 text-[9px] px-2 py-1 rounded ${
            data.isCompleted
              ? 'bg-emerald-500 text-white'
              : 'bg-stone-800 text-orange-500 border border-orange-900'
          }`}
        >
          {data.isCompleted ? 'تم الإنجاز ✓' : 'تحديد كمكتمل'}
        </button>
      </div>

      <Handle type="source" position={Position.Left} className="!bg-orange-500" />
    </div>
  );
}
