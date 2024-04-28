import { useEffect, useState } from "react";


export type Dimensions = {width:number, height:number};

export default function useResize() {

    const [dimensions, setDimensions] = useState({width:0, height:0});

    useEffect(() => {

        function resize() {
        //   console.log('window.innerWidth', window.innerWidth)
            setDimensions({width:window.innerWidth, height:window.innerHeight});
        }
    
        window.addEventListener('resize', resize);
        resize();
    
        return () => {
          window.removeEventListener('resize', resize);
        }
      }, [])

    return {
        dimensions,
    };
};