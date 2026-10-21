import { motion } from "framer-motion";

const LoaderSpinner = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-primary-light md:h-16 md:w-16"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 1,
        }}
      />
    </div>
  );
};

export default LoaderSpinner;
