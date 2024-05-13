'use client'

import { useGlobalProvider } from "@/src/providers/GlobalProvider";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SetLoadingFalse() {
    const path = usePathname();
    
    const globalState = useGlobalProvider();
    const { setCurrRoute } = globalState.changingRoute;
  
  
    useEffect(() => {
      setCurrRoute();
    }, []);
  
    return <div />
  }