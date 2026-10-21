import { cva } from "class-variance-authority";
import { clsx } from "clsx";

const skeletonStyles = cva([
  "bg-[linear-gradient(90deg,_#e4e4e7_25%,_#d6d6da_50%,_#e4e4e7_75%)]",
  "animate-shimmer bg-[length:200%_100%]",
]);

const Skeleton = ({ className }) => {
  return <div className={clsx(className, skeletonStyles())}></div>;
};

Skeleton.displayName = "Skeleton";

export default Skeleton;
