import Header from "@/components/global/header";
import NavButtons from "@/components/global/nav-buttons";

export default function BBLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <div
        className="fixed inset-0 z-[-1]" 
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

      <Header />

      
     <main className="flex-1 overflow-y-auto pb-24 md:pb-8 z-10" dir="rtl">
   {children}
</main>

      <div className='border-t border-white/10 fixed bottom-0 w-full md:hidden bg-[#0a0a0a]/80 backdrop-blur-md z-50'>
        <NavButtons />
      </div>
    </div>
  )
}