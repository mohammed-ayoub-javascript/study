import { Book, Github, Plus, School2, TextAlignJustify } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import SettingsDialog from './client/dialog-settings';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const navLinks = [
    { name: 'اضافة حصة', href: '/session/new', icon: Plus },
    { name: 'الكتب', href: '/session/book', icon: Book },
    { name: 'المواد', href: '/session/subjects', icon: School2 },
  ];
  return (
    <div className="flex justify-between w-full items-center flex-row p-3 border">
      <div className="flex justify-center items-center flex-row gap-3">
        <Sheet>
          <SheetTrigger>
            <Button>
              <TextAlignJustify />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>الصفحات</SheetTitle>
              <SheetDescription className="flex w-full justify-center items-center flex-col">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} className="w-full">
                      <Button
                        className="w-full p-1 mt-1 mb-1 pl-3 pr-3 flex justify-between items-center flex-row"
                        variant="outline"
                        size="icon"
                        title={link.name}
                      >
                        {link.name}
                        <Icon size={20} />
                      </Button>
                    </Link>
                  );
                })}
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        <Link href={'https://github.com/mohammed-ayoub-javascript/endline'} target="_blank">
          <Button variant={'outline'}>
            <Github />
          </Button>
        </Link>
        <SettingsDialog />
      </div>

      <Link href={'/'} className=" curser-pointer">
        <div className="text-white text-2xl font-bold">Endline</div>
      </Link>
    </div>
  );
};

export default Header;
