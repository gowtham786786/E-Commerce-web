import { motion } from 'framer-motion';
import SEO from './SEO';

const PageTransition = ({ children, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col flex-1"
    >
      <SEO title={title} description={description} />
      {children}
    </motion.div>
  );
};

export default PageTransition;
