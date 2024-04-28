'use client';

import WaveDivision from "@/src/components/styles/WaveDivision/inddex";
import colors from "@/src/constants/colors";
import { useGlobalProvider } from "@/src/providers/GlobalProvider";

interface WrapperProps {
    children:React.ReactNode;
};

export default function Wrapper({children}:WrapperProps) {

    const globalState = useGlobalProvider();
    const dimensions = globalState.dimensions;


  return (
      <div className="flex relative overflow-hidden items-start justify-center w-full max-sm:min-h-[150vh] min-h-[100vh]" style={{backgroundColor:'white', minHeight:dimensions.width > 1000 && (dimensions.width / dimensions.height) < 1.77 ? '180vh': '100vh'}} >
        <div className="absolute inset-x-0 top-[-90px] z-0">
            <WaveDivision color={colors.valero()} screenWidth={dimensions.width} />
        </div>
        <div className='w-full h-full absolute' style={{backgroundColor:colors.valero(), top:300}} >
            {children}
        </div>
      </div>
  );
}
