
interface WrapperProps {
    children:React.ReactNode;
    childrenLength?:number;
};

export default function CardSectionWrapper({children, childrenLength}:WrapperProps) {

  const minHeight = !childrenLength ? '80vh' : `${Math.ceil((childrenLength / 3) * 50)}vh`;


  return (
      <div className="flex items-start justify-center w-full min-h-[80vh] bg-white overflow-auto" style={{minHeight}} >
        <div className='grid max-sm:grid-cols-2 max-sm:px-4 grid-cols-3 md:max-w-[768px] mt-[30px] gap-6' >
            {children}
            <div className="min-h-[50px]" />
        </div>
      </div>
  );
}
