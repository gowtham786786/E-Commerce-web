import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel = "Start Shopping", 
  actionLink = "/shop" 
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-20 px-4 min-h-[60vh]">
      {Icon && (
        <div className="w-24 h-24 bg-accent-light rounded-full flex items-center justify-center mb-6">
          <Icon className="w-12 h-12 text-primary" />
        </div>
      )}
      <h2 className="text-3xl font-bold text-neutral-dark mb-4">{title}</h2>
      <p className="text-neutral mb-8 max-w-md">{description}</p>
      
      {actionLabel && actionLink && (
        <Link 
          to={actionLink} 
          className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
