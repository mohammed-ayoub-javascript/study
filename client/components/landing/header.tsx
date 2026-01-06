import { Github, User } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

const HeaderLanding = () => {
  return (
    <div className="p-3 z-50 fixed w-full border backdrop-blur-sm flex justify-between items-center flex-row">
      <h1 className="text-4xl font-bold">EndLine</h1>
      <div>
        <Link href={'/auth'}>
          <Button>
            <User />
          </Button>
        </Link>
        <Link target="_blank" href={'https://github.com/mohammed-ayoub-javascript/endline'}>
          <Button className="ml-1 mr-1">
            <Github />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HeaderLanding;
