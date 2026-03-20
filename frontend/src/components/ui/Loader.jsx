import React from 'react';

const Loader = ({ size = "md" }) => {
  const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-12 h-12" : "w-8 h-8";
  
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClass} border-4 border-[#00f2fe]/20 border-t-[#00f2fe] rounded-full animate-spin transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)]`}></div>
    </div>
  );
};

export default Loader;
