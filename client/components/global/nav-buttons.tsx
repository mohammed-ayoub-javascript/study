import { Book, BringToFront, Github, Home, Plus, School, User } from 'lucide-react';
import Link from 'next/link';

const NavButtons = () => {
  return (
    <div className="flex border backdrop-blur-sm justify-between  pl-10 pr-10 p-2  items-center flex-row">
      <Link href={'/session'}>
        <Home />
      </Link>
      <Link href={'/session/map/test'}>
        <BringToFront />
      </Link>
      <div className="rounded-full bg-muted  p-3  flex justify-center items-cetner flex-col">
        <Link href={'/session/new'}>
          <Plus />
        </Link>
      </div>
      <Link href={'/session/book'}>
        <Book />
      </Link>

      <Link href={'/session/subjects'}>
        <School />
      </Link>
    </div>
  );
};

export default NavButtons;
