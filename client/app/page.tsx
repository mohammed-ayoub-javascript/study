import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <div className="min-h-screen w-full bg-black relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
        radial-gradient(
          circle at center,
          rgba(245, 158, 11, 0.12) 0%,
          rgba(245, 158, 11, 0.06) 20%,
          rgba(0, 0, 0, 0.0) 60%
        )
      `,
          }}
        />
        <div className="h-screen flex justify-center items-center flex-col w-full">
          <h1 className="text-xl md:text-4xl lg:text-5xl font-bold">FOCUS</h1>
          <h3 className="text-2xl font-bold mt-4 text-gray-500">
            ابدأ رحلة الدراسة بالتركيز التام الخالي من التشتت
          </h3>
          <Link className="w-1/4" href={'/auth'}>
            <Button className="w-full mt-4"> البدأ الان</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
