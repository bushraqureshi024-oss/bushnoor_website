import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_PROMOS, BRAND_NAME } from './constants';
import { Product, User, PromoCode, CartItem } from './types';
import { Hero } from './components/Hero';
import { TryOnModal } from './components/TryOnModal';
import { AdminPanel } from './components/AdminPanel';
import { ChatBot } from './components/ChatBot';
import { CartDrawer } from './components/CartDrawer';
import { ShoppingBag, User as UserIcon, LogIn, Menu, ShieldCheck, Facebook, Instagram, Twitter, Mail, X, Sparkles } from 'lucide-react';

// Authentication Modal
const AuthModal: React.FC<{ onClose: () => void; onLogin: (u: User) => void }> = ({ onClose, onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Login Logic - Admin check based on email string
        const newUser: User = {
            email,
            name: name || email.split('@')[0],
            isAdmin: email.toLowerCase().includes('admin'),
            tryOnCount: 0
        };
        onLogin(newUser);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white text-black p-8 rounded-lg w-full max-w-md relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={24} /></button>
                <h2 className="text-2xl font-serif font-bold mb-6 text-center">{isLogin ? 'Welcome Back' : 'Join BushNoor'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <input className="w-full border p-3 rounded" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} />
                    )}
                    <input className="w-full border p-3 rounded" type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} />
                    <input className="w-full border p-3 rounded" type="password" placeholder="Password" required />
                    <button type="submit" className="w-full bg-black text-white py-3 font-bold hover:bg-gold-500 transition">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>
                <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center mt-4 text-sm text-gray-500 hover:underline">
                    {isLogin ? "New here? Create account" : "Already have an account? Sign in"}
                </button>
                <div className="mt-4 text-xs text-gray-400 text-center">
                    <p>Tip: Use an email containing "admin" to access CMS.</p>
                </div>
            </div>
        </div>
    );
};

// Content Modal for Policies/Contact
const ContentModal: React.FC<{ title: string; content: React.ReactNode; onClose: () => void }> = ({ title, content, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white text-black rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto relative p-8 shadow-2xl">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black"><X size={24} /></button>
                 <h2 className="text-3xl font-serif font-bold mb-6 text-gold-600">{title}</h2>
                 <div className="prose max-w-none text-gray-600">
                    {content}
                 </div>
            </div>
        </div>
    );
};

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [promos, setPromos] = useState<PromoCode[]>(INITIAL_PROMOS);
  const [user, setUser] = useState<User | null>(null);
  const [guestTryOnCount, setGuestTryOnCount] = useState(0);
  const [headerMessage, setHeaderMessage] = useState("FREE SHIPPING ON ORDERS OVER $500 | USE CODE: LUXE10");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // UI States
  const [showAuth, setShowAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Party Wear' | 'Wedding Wear'>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Policy Modal State
  const [activePolicy, setActivePolicy] = useState<'privacy' | 'return' | 'contact' | null>(null);

  // --- Visitor & Cart Persistence Logic ---

  // 1. Log Visitor on Mount
  useEffect(() => {
    const logVisitor = () => {
        const historyKey = 'visitor_logs';
        const rawHistory = localStorage.getItem(historyKey);
        const history = rawHistory ? JSON.parse(rawHistory) : [];
        const newLog = { timestamp: new Date().toISOString(), page: 'Home' };
        // Keep last 50 logs
        const updatedHistory = [newLog, ...history].slice(0, 50);
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    };
    logVisitor();
  }, []);

  // 2. Load Cart Persistence (3 Days Validity)
  useEffect(() => {
      const loadCart = () => {
          const storageKey = user ? `cart_${user.email}` : 'cart_guest';
          const rawData = localStorage.getItem(storageKey);
          
          if (rawData) {
              try {
                  const { items, timestamp } = JSON.parse(rawData);
                  const now = Date.now();
                  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
                  
                  if (now - timestamp < threeDaysMs) {
                      setCart(items);
                  } else {
                      // Expired
                      localStorage.removeItem(storageKey);
                  }
              } catch (e) {
                  console.error("Failed to parse cart", e);
              }
          } else {
              setCart([]);
          }
      };

      loadCart();
  }, [user]); // Reload when user state changes

  // 3. Save Cart Persistence on Change
  useEffect(() => {
      if (cart.length > 0) {
        const storageKey = user ? `cart_${user.email}` : 'cart_guest';
        const data = {
            items: cart,
            timestamp: Date.now()
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
  }, [cart, user]);

  // Load guest usage from local storage
  useEffect(() => {
    const saved = localStorage.getItem('guestTryOnCount');
    if (saved) setGuestTryOnCount(parseInt(saved, 10));
  }, []);

  const handleIncrementUsage = () => {
    if (user) {
        setUser({ ...user, tryOnCount: user.tryOnCount + 1 });
    } else {
        const newCount = guestTryOnCount + 1;
        setGuestTryOnCount(newCount);
        localStorage.setItem('guestTryOnCount', newCount.toString());
    }
  };

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const handleCheckout = () => {
    if (!user) {
        setShowAuth(true);
        return;
    }
    alert(`Processing payment for $${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}. Thank you for shopping with BushNoor!`);
    setCart([]);
    setIsCartOpen(false);
    // Clear storage on successful checkout
    const storageKey = user ? `cart_${user.email}` : 'cart_guest';
    localStorage.removeItem(storageKey);
  };

  const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      
      {/* Sticky Promo Header */}
      {headerMessage && (
          <div className="fixed top-0 w-full z-50 bg-gold-600 text-white text-center text-xs md:text-sm font-bold tracking-widest py-2 px-4 shadow-sm">
              {headerMessage}
          </div>
      )}

      {/* Navigation */}
      <nav className={`fixed w-full z-40 transition-all duration-300 ${headerMessage ? 'top-8' : 'top-0'} bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={scrollToTop} title="Scroll to top">
              <span className="font-serif text-2xl font-bold tracking-tighter text-black uppercase">Bush<span className="text-gold-500">Noor</span></span>
            </div>
            
            <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide uppercase">
              <button onClick={() => setActiveCategory('All')} className={`hover:text-gold-500 transition ${activeCategory === 'All' ? 'text-gold-600 font-bold' : 'text-gray-500'}`}>Category</button>
              <button onClick={() => setActiveCategory('Party Wear')} className={`hover:text-gold-500 transition ${activeCategory === 'Party Wear' ? 'text-gold-600 font-bold' : 'text-gray-500'}`}>Party Wear</button>
              <button onClick={() => setActiveCategory('Wedding Wear')} className={`hover:text-gold-500 transition ${activeCategory === 'Wedding Wear' ? 'text-gold-600 font-bold' : 'text-gray-500'}`}>Wedding Wear</button>
            </div>

            <div className="flex items-center space-x-6">
              {user?.isAdmin && (
                  <button onClick={() => setShowAdmin(true)} className="text-gold-600 hover:text-black" title="CMS Admin Panel">
                      <ShieldCheck size={20} />
                  </button>
              )}
              {user ? (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <UserIcon size={18} />
                    <span className="hidden sm:inline font-semibold">{user.name}</span>
                    <button onClick={() => setUser(null)} className="ml-2 text-xs uppercase hover:text-red-500">Sign Out</button>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)} className="flex items-center gap-2 text-xs bg-black text-white px-3 py-1.5 rounded-full font-bold hover:bg-gold-500 transition shadow-md">
                  <LogIn size={14} /> <span>Sign In / Join</span>
                </button>
              )}
              <button 
                className="hover:text-gold-600 relative text-black"
                onClick={() => setIsCartOpen(true)}
              >
                  <ShoppingBag size={20} />
                  {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gold-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {cart.reduce((acc, item) => acc + item.quantity, 0)}
                      </span>
                  )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        <Hero />

        <div id="collection" className="max-w-7xl mx-auto px-4 py-24">
            <div className="text-center mb-16">
                <h2 className="font-serif text-4xl text-black mb-4">
                    {activeCategory === 'All' ? 'Latest Collection' : `${activeCategory} Collection`}
                </h2>
                <div className="w-24 h-1 bg-gold-500 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                    <div key={product.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                        <div className="relative aspect-[2/3] overflow-hidden border-b border-gray-200">
                            <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            {/* Overlay with Actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                                <button 
                                    onClick={() => setSelectedProduct(product)}
                                    className="bg-white text-black px-6 py-3 uppercase text-xs font-bold tracking-widest hover:bg-gold-400 hover:text-white hover:scale-105 transition w-48 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <Sparkles size={14} /> Virtual Try On
                                </button>
                                <button 
                                    onClick={() => addToCart(product)}
                                    className="bg-black text-white border border-white px-6 py-3 uppercase text-xs font-bold tracking-widest hover:bg-white hover:text-black hover:scale-105 transition w-48 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <ShoppingBag size={14} /> Add to Bag
                                </button>
                            </div>
                        </div>
                        <div className="p-6 text-center">
                            <h3 className="font-serif text-lg md:text-xl mb-2 text-gray-900">{product.name}</h3>
                            <p className="text-gold-600 font-bold mb-2 text-lg">${product.price}</p>
                            <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* About/Brand Section */}
        <section id="about" className="bg-white text-black py-20 px-4 border-t border-gray-200">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="font-serif text-4xl mb-6">The Essence of BushNoor</h2>
                <p className="font-light text-lg leading-relaxed text-gray-600">
                    Born from a desire to merge timeless tradition with contemporary silhouettes, BushNoor caters to the modern woman who cherishes her heritage. Whether it is a grand wedding celebration or an intimate evening soiree, our designs are crafted to make you feel extraordinary.
                </p>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black py-16 text-center text-gray-400 text-sm border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-center space-x-8 mb-8">
                <a href="#" className="text-gray-400 hover:text-white transition"><Facebook size={24} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><Instagram size={24} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><Twitter size={24} /></a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8 uppercase tracking-widest text-xs font-semibold">
                <button onClick={() => setActivePolicy('contact')} className="hover:text-gold-400">Contact Us</button>
                <button onClick={() => setActivePolicy('return')} className="hover:text-gold-400">Return Policy</button>
                <button onClick={() => setActivePolicy('privacy')} className="hover:text-gold-400">Privacy Policy</button>
            </div>

            <p className="font-serif text-lg mb-2 text-white">BushNoor</p>
            <p>&copy; {new Date().getFullYear()} BushNoor. All rights reserved.</p>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={(u) => { setUser(u); setShowAuth(false); }} />}
      
      {selectedProduct && (
        <TryOnModal 
            product={selectedProduct} 
            user={user}
            guestUsageCount={guestTryOnCount}
            onClose={() => setSelectedProduct(null)} 
            onIncrementUsage={handleIncrementUsage}
            onRequestSignup={() => { setSelectedProduct(null); setShowAuth(true); }}
        />
      )}

      {showAdmin && user?.isAdmin && (
        <AdminPanel 
            products={products}
            promos={promos}
            headerMessage={headerMessage}
            onUpdateProducts={setProducts}
            onUpdatePromos={setPromos}
            onUpdateHeaderMessage={setHeaderMessage}
            onClose={() => setShowAdmin(false)}
        />
      )}

      <CartDrawer 
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
      />

      {activePolicy === 'return' && (
          <ContentModal 
            title="Return Policy"
            onClose={() => setActivePolicy(null)}
            content={
                <div className="space-y-4">
                    <p className="font-bold">7-Day Return Guarantee</p>
                    <p>At BushNoor, we want you to be completely satisfied with your purchase. If for any reason you are not, we accept returns within 7 days of the delivery date.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Items must be unworn, unwashed, and in their original condition with all tags attached.</li>
                        <li>Custom-tailored items are not eligible for return unless there is a manufacturing defect.</li>
                        <li>Sale items are final sale and cannot be returned.</li>
                    </ul>
                    <p>To initiate a return, please contact our support team.</p>
                </div>
            }
          />
      )}

      {activePolicy === 'privacy' && (
          <ContentModal 
            title="Privacy Policy"
            onClose={() => setActivePolicy(null)}
            content={
                <div className="space-y-4">
                    <p>Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information.</p>
                    <h4 className="font-bold mt-4">Information We Collect</h4>
                    <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
                    <h4 className="font-bold mt-4">How We Use Your Information</h4>
                    <p>We use your information to process transactions, provide customer service, and send you updates about our products and promotions.</p>
                    <p>We do not sell your personal data to third parties.</p>
                </div>
            }
          />
      )}

      {activePolicy === 'contact' && (
          <ContentModal 
            title="Contact Us"
            onClose={() => setActivePolicy(null)}
            content={
                <div className="space-y-4">
                    <p>We'd love to hear from you. Please reach out to us with any questions or concerns.</p>
                    <div className="flex items-center gap-3 mt-6">
                        <div className="bg-gold-100 p-3 rounded-full text-gold-600"><Mail /></div>
                        <div>
                            <p className="font-bold">Email</p>
                            <p>support@bushnoor.com</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 mt-4">
                        <div className="bg-gold-100 p-3 rounded-full text-gold-600"><UserIcon /></div>
                        <div>
                            <p className="font-bold">Customer Service Hours</p>
                            <p>Mon - Fri: 9:00 AM - 6:00 PM EST</p>
                        </div>
                    </div>
                </div>
            }
          />
      )}

      <ChatBot />
    </div>
  );
}