import {  Github, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import SettingsDialog from './client/dialog-settings';

const Header = () => {
  return (
    <div className="flex justify-between w-full items-center flex-row p-3 border">
      <div className="flex justify-center items-center flex-row gap-3">
        <Link href={'/session/new'}>
          <Button className="mr-1 ml-1">
            <Plus />
          </Button>
        </Link>
        <Link className='' href={"https://github.com/mohammed-ayoub-javascript/endline"} target='_blank'>
        <Button>
          <Github />
        </Button>
        </Link>
        <SettingsDialog />
      </div>

      <Link href={'/'} className=" curser-pointer">
        <div className="text-white text-2xl font-bold">Focus</div>
      </Link>
    </div>
  );
};

export default Header;
