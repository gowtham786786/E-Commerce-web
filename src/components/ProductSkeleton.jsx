const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-light overflow-hidden animate-pulse">
      <div className="relative aspect-square bg-neutral-light/50"></div>
      <div className="p-4 flex flex-col h-[180px]">
        <div className="h-4 bg-neutral-light rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-neutral-light rounded w-1/2 mb-4"></div>
        
        <div className="flex items-center space-x-1 mb-2">
          <div className="h-3 bg-neutral-light rounded w-20"></div>
        </div>
        
        <div className="mt-auto">
          <div className="h-6 bg-neutral-light rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-neutral-light rounded-lg w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
