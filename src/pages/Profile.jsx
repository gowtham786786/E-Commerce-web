import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { formatCurrency, convertUsdToInr } from '../utils/formatCurrency';
import { User, MapPin, Package, LogOut, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (currentUser?.addresses?.length > 0) {
      setAddress(currentUser.addresses[0]);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.uid) return;
      try {
        // Removed orderBy('createdAt', 'desc') to avoid Firestore composite index requirement.
        // We will sort client-side instead.
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort orders by date descending client-side
        ordersData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return dateB - dateA;
        });

        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const getExpectedDelivery = (createdAt) => {
    if (!createdAt?.toDate) return 'Pending...';
    const deliveryDate = new Date(createdAt.toDate());
    deliveryDate.setDate(deliveryDate.getDate() + 4); // Predict delivery 4 days after order
    return deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        addresses: [address]
      });
      // Force reload or just update local state
      setIsEditingAddress(false);
      // In a real app we'd update AuthContext or use an observer, but this works for demo
      currentUser.addresses = [address];
    } catch (error) {
      console.error("Error updating address:", error);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-neutral-dark mb-8">My Account</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-light">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-neutral-light" />
              ) : (
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-neutral-dark">{currentUser.displayName || currentUser.name || 'User'}</h2>
                <p className="text-neutral text-sm">{currentUser.email}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Default Address
              </h3>
              {!isEditingAddress && (
                <button 
                  onClick={() => setIsEditingAddress(true)}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingAddress ? (
              <form onSubmit={handleSaveAddress} className="space-y-3">
                <input 
                  type="text" placeholder="Street Address" required
                  value={address.street} onChange={e => setAddress({...address, street: e.target.value})}
                  className="w-full border border-neutral-light rounded-lg p-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" placeholder="City" required
                    value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-2 text-sm"
                  />
                  <input 
                    type="text" placeholder="State/Province" required
                    value={address.state} onChange={e => setAddress({...address, state: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" placeholder="ZIP Code" required
                    value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-2 text-sm"
                  />
                  <input 
                    type="text" placeholder="Country" required
                    value={address.country} onChange={e => setAddress({...address, country: e.target.value})}
                    className="w-full border border-neutral-light rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEditingAddress(false)}
                    className="flex-1 py-2 text-neutral hover:bg-neutral-light rounded-lg transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={savingAddress}
                    className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                  >
                    {savingAddress ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-neutral text-sm">
                {currentUser.addresses?.length > 0 ? (
                  <>
                    <p>{currentUser.addresses[0].street}</p>
                    <p>{currentUser.addresses[0].city}, {currentUser.addresses[0].state} {currentUser.addresses[0].zip}</p>
                    <p>{currentUser.addresses[0].country}</p>
                  </>
                ) : (
                  <p className="italic text-neutral-light">No address saved yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Orders */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-light p-6 h-full">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-neutral-light pb-4">
              <Package className="w-6 h-6 text-primary" /> Order History
            </h3>

            {loadingOrders ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="border border-neutral-light rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div>
                        <p className="text-xs text-neutral">Order #{order.id}</p>
                        <p className="font-medium text-neutral-dark">
                          Ordered: {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                        </p>
                        {order.status !== 'delivered' && (
                          <p className="text-sm font-medium text-green-600 mt-1 flex items-center gap-1">
                            <Truck className="w-4 h-4" />
                            Expected Delivery: {getExpectedDelivery(order.createdAt)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                            'bg-amber-100 text-amber-700'}
                        `}>
                          {order.status}
                        </span>
                        <p className="text-sm text-neutral mt-2">Total</p>
                        <p className="font-bold text-lg leading-tight">{formatCurrency(convertUsdToInr(order.total))}</p>
                      </div>
                    </div>

                    <div className="bg-neutral-light/30 rounded-lg p-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-2 border-b border-neutral-light/50 last:border-0">
                          <div className="w-12 h-12 bg-white rounded overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-dark truncate">{item.name}</p>
                            <p className="text-sm text-neutral">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-neutral-dark mt-1">
                            {formatCurrency(convertUsdToInr(item.price * item.quantity))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Package}
                title="No orders yet"
                description="When you place an order, it will appear here."
                actionLabel="Start Shopping"
                actionLink="/shop"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
