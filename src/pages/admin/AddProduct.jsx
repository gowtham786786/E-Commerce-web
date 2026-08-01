import ProductForm from '../../components/admin/ProductForm';
import { motion } from 'framer-motion';

const AddProduct = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-12"
    >
      <ProductForm isEditing={false} />
    </motion.div>
  );
};

export default AddProduct;
