import { Suspense } from 'react';
import NewBookContent from './NewBookContent';
import { Loader2 } from 'lucide-react';

export default function NewBookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
      }
    >
      <NewBookContent />
    </Suspense>
  );
}
