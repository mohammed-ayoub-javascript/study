import { Github } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <div className="w-full flex justify-cetner items-center flex-col mt-[150px] p-3">
      <div>
        <p className="text-xl font-bold">endline</p>
      </div>

      <div className="flex justify-center items-center flex-row">
        <Link href={'https://github.com/mohammed-ayoub-javascript/endline'}>
          <Github />
        </Link>
      </div>

      <p className="mt-4 text-sm">محمد أيوب - الجزائر ولاية مستغانم</p>
    </div>
  );
};

export default Footer;
