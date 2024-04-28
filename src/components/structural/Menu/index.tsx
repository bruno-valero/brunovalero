
import { ReactNode } from 'react';
import { SheetCustom } from './SheetCustom/index';


interface MenuProps {
  children:ReactNode;
}

export default async function Menu({ children }:MenuProps) {
  return (
    <SheetCustom >      
      {children}
    </SheetCustom>
  );
}
