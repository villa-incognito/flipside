import React, { useEffect, useRef } from "react";

interface GridContainerProps {
  children: React.ReactNode;
  onReachThreshold?: () => void;
}

const GridContainer = ({ children, onReachThreshold }: GridContainerProps) => {
  const scrollRef = useRef(null);
  useEffect(() => {
    var options = {
      root: null, //viewport
      rootMargin: "0px",
      threshold: 1.0,
    };
    const observer = new IntersectionObserver(handleObserver, options);
    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }
  }, []);

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0];
    if (target?.isIntersecting) {
      onReachThreshold?.();
    }
  };

  return (
    <div className="relative grid grid-cols-1 gap-x-6 gap-y-6 px-6 sm:grid-cols-3 lg:grid-cols-4">
      {children}
      <div ref={scrollRef} className="absolute bottom-0 h-[200px]" />
    </div>
  );
};

export default GridContainer;
