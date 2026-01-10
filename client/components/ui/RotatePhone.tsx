'use client';

import { useEffect } from 'react';

const RotatePhone = () => {
  useEffect(() => {
    const lockOrientation = async () => {
      if (typeof window !== 'undefined' && window.screen?.orientation?.lock) {
        try {
          await window.screen.orientation.lock('landscape');
        } catch (err) {
          console.log('Orientation lock not supported:', err);
        }
      }
    };
    
    lockOrientation();
    
    return () => {
      if (typeof window !== 'undefined' && window.screen?.orientation?.unlock) {
        window.screen.orientation.unlock();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white p-6">
      <style jsx global>{`
        body {
          overflow: hidden;
          margin: 0;
          padding: 0;
          background-color: black;
        }
      `}</style>
      
      <div className="animate-spin mb-8 text-6xl">🔄</div>
      
      <h1 className="text-2xl font-bold mb-4 text-center">
        يرجى تدوير هاتفك
      </h1>
      
      <p className="text-gray-300 text-center mb-6 max-w-md">
        للتجربة المثالية، يرجى تدوير هاتفك إلى الوضع الأفقي (عرضي)
      </p>
      
      <div className="bg-gray-800 rounded-lg p-4 max-w-sm">
        <p className="text-sm text-gray-300">
          <span className="block mb-2">💡 تلميح:</span>
          قم بتعطيل قفل التدوير في إعدادات هاتفك للحصول على أفضل تجربة
        </p>
      </div>
      
      <button
        onClick={() => window.location.reload()}
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
      >
        تحديث الصفحة بعد التدوير
      </button>
    </div>
  );
};

export default RotatePhone;