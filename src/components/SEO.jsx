import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description }) => {
  const defaultTitle = "ShopMate - Your Ultimate Shopping Destination";
  const defaultDescription = "Discover amazing products across electronics, fashion, home, and more at ShopMate.";
  
  return (
    <Helmet>
      <title>{title ? `${title} | ShopMate` : defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
    </Helmet>
  );
};

export default SEO;
