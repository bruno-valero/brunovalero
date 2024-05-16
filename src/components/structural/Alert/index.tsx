'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { useEffect, useRef } from "react";
  
  export function Alert() {

    const triggerRef = useRef<HTMLButtonElement>(null);

    const globalState = useGlobalProvider();
    const [publicError, setPublicError] = globalState.publicError;

    useEffect(() => {
        if (publicError.message || publicError.title) {
            triggerRef.current?.click();
        };
    }, [publicError.message, publicError.title]);

    return (
      <AlertDialog onOpenChange={(e) => !e && setPublicError({message:'', title:''})} >
        <AlertDialogTrigger ref={triggerRef} className="hidden" asChild >
          <Button variant="outline">Show Dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{publicError.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {publicError.message.split('\n').map((item, i) => (
                <div key={`${i+1}`}>
                    <span>{item}</span>
                    <br />
                </div>
              ))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
            <AlertDialogAction onClick={() => publicError.action?.()} >Entendi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  