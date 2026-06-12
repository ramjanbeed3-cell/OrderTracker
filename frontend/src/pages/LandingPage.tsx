import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '⚡', title: 'Real-Time Tracking', desc: 'Track your order live on map with GPS precision. Know exactly where your delivery is at all times.' },
  { icon: '🚀', title: 'Lightning Fast', desc: 'Average delivery time of just 28 minutes. We pick up and deliver faster than anyone else.' },
  { icon: '🔒', title: '100% Secure', desc: 'Your payment and personal data is fully encrypted and protected with bank-level security.' },
  { icon: '💰', title: 'Free Delivery', desc: 'Enjoy free delivery on all orders. No hidden charges, no minimum order value.' },
  { icon: '🎯', title: '94% On-Time', desc: 'We deliver on time, every time. Our drivers are trained professionals committed to punctuality.' },
  { icon: '📞', title: '24/7 Support', desc: 'Our support team is available round the clock to help you with any issues.' },
];

const MENU_ITEMS = [
  { emoji: '🍛', name: 'Biryani', price: '₹250', time: '30 min', rating: '4.8', category: 'Rice' },
  { emoji: '🍕', name: 'Pizza', price: '₹350', time: '25 min', rating: '4.7', category: 'Italian' },
  { emoji: '🍔', name: 'Burger', price: '₹150', time: '20 min', rating: '4.6', category: 'Fast Food' },
  { emoji: '🍜', name: 'Noodles', price: '₹180', time: '15 min', rating: '4.5', category: 'Chinese' },
  { emoji: '🥞', name: 'Dosa', price: '₹80', time: '10 min', rating: '4.9', category: 'South Indian' },
  { emoji: '🍦', name: 'Ice Cream', price: '₹90', time: '5 min', rating: '4.8', category: 'Dessert' },
  { emoji: '🥘', name: 'Haleem', price: '₹220', time: '35 min', rating: '4.7', category: 'Hyderabadi' },
  { emoji: '☕', name: 'Filter Coffee', price: '₹50', time: '8 min', rating: '4.9', category: 'Beverages' },
];

const REVIEWS = [
  { name: 'Priya Sharma', city: 'Hyderabad', rating: 5, review: 'Absolutely love this app! Food arrives hot and on time. The live tracking feature is amazing!', avatar: 'P', color: 'bg-pink-500' },
  { name: 'Rahul Mehta', city: 'Mumbai', rating: 5, review: 'Best delivery app I have used. Free delivery and super fast. Highly recommended!', avatar: 'R', color: 'bg-blue-500' },
  { name: 'Ananya Reddy', city: 'Bangalore', rating: 5, review: 'The real-time tracking is a game changer. I can see exactly where my driver is. 10/10!', avatar: 'A', color: 'bg-purple-500' },
  { name: 'Karthik Iyer', city: 'Chennai', rating: 4, review: 'Great service and friendly drivers. The app is very smooth and easy to use.', avatar: 'K', color: 'bg-green-500' },
  { name: 'Sneha Patel', city: 'Delhi', rating: 5, review: 'Amazing experience! The support team resolved my issue in under 2 minutes. Wow!', avatar: 'S', color: 'bg-orange-500' },
  { name: 'Vikram Singh', city: 'Pune', rating: 5, review: 'Free delivery every single time! Food quality is excellent. Will always use this app.', avatar: 'V', color: 'bg-red-500' },
];

const SUPPORT = [
  { icon: '📞', title: 'Phone Support', value: '+91 1800-123-4567', desc: 'Available 24/7', color: 'bg-blue-50 border-blue-200' },
  { icon: '📧', title: 'Email Support', value: 'support@ordertracker.com', desc: 'Reply within 1 hour', color: 'bg-green-50 border-green-200' },
  { icon: '💬', title: 'Live Chat', value: 'Chat with us now', desc: 'Instant response', color: 'bg-purple-50 border-purple-200' },
  { icon: '🏢', title: 'Office', value: 'HITEC City, Hyderabad', desc: 'Mon-Sat 9am-6pm', color: 'bg-orange-50 border-orange-200' },
];

const DELIVERY_ZONES = [
  { city: 'Hyderabad', areas: 'All areas', time: '20-30 min', charge: 'FREE' },
  { city: 'Bangalore', areas: 'All areas', time: '25-35 min', charge: 'FREE' },
  { city: 'Mumbai', areas: 'All areas', time: '25-40 min', charge: 'FREE' },
  { city: 'Delhi', areas: 'All areas', time: '30-45 min', charge: 'FREE' },
  { city: 'Chennai', areas: 'All areas', time: '20-35 min', charge: 'FREE' },
  { city: 'Pune', areas: 'All areas', time: '25-40 min', charge: 'FREE' },
];

const STATS = [
  { value: '50,000+', label: 'Happy Customers' },
  { value: '1,200+', label: 'Active Drivers' },
  { value: '28 min', label: 'Avg Delivery Time' },
  { value: '4.8 ⭐', label: 'Average Rating' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white text-lg">
              🚀
            </div>
            <span className="font-bold text-xl text-gray-900">OrderTracker</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
            <a href="#menu" className="hover:text-orange-600 transition-colors">Menu</a>
            <a href="#delivery" className="hover:text-orange-600 transition-colors">Delivery</a>
            <a href="#reviews" className="hover:text-orange-600 transition-colors">Reviews</a>
            <a href="#support" className="hover:text-orange-600 transition-colors">Support</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">Login</Link>
            <Link to="/register" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-orange-500 via-red-500 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-white text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Now delivering across 6 major cities in India
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Food Delivered<br/>
            <span className="text-yellow-300">Lightning Fast</span> ⚡
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Real-time order tracking, free delivery, and 28-minute average delivery time. 
            The smartest food delivery platform in India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl text-lg hover:shadow-2xl transition-all hover:-translate-y-1">
              🚀 Order Now — It's Free!
            </Link>
            <Link to="/login"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-all">
              Sign In →
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/20 backdrop-blur rounded-2xl p-4 text-white">
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-orange-100 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-2">Order in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📱', title: 'Place Your Order', desc: 'Browse our menu and place your order in seconds from anywhere' },
              { step: '02', icon: '🚚', title: 'We Assign a Driver', desc: 'Our nearest driver gets assigned instantly and picks up your order' },
              { step: '03', icon: '🎉', title: 'Fast Delivery', desc: 'Track live on map and receive your order in under 30 minutes' },
            ].map(s => (
              <div key={s.step} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-lg shadow-orange-200">
                  {s.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 mt-4">{s.title}</h3>
                <p className="text-gray-500 text-sm mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">Why Choose OrderTracker?</h2>
            <p className="text-gray-500 mt-2">We're not just a delivery app — we're your food partner</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center text-2xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">🍽️ Our Popular Menu</h2>
            <p className="text-gray-500 mt-2">Fresh, delicious food delivered to your doorstep</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MENU_ITEMS.map(item => (
              <div key={item.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 text-center">
                  <span className="text-5xl">{item.emoji}</span>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">⭐ {item.rating}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{item.category}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-orange-600 text-lg">{item.price}</p>
                      <p className="text-xs text-gray-400">⏱️ {item.time}</p>
                    </div>
                    <Link to="/register"
                      className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors">
                      Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/register" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
              View Full Menu & Order Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Delivery Info */}
      <section id="delivery" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">🚚 Delivery Information</h2>
            <p className="text-gray-500 mt-2">We deliver to all major cities across India</p>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="font-bold text-green-800 text-lg mb-4">✅ What We Offer</h3>
              <ul className="space-y-2 text-green-700 text-sm">
                {['Free delivery on all orders', 'Real-time GPS tracking', 'Contactless delivery available', 'Live driver communication', 'Temperature-controlled packaging', 'On-time guarantee or refund'].map(i => (
                  <li key={i} className="flex items-center gap-2"><span>✓</span> {i}</li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-bold text-blue-800 text-lg mb-4">📦 Delivery Charges</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-700 text-sm">Standard Delivery</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-700 text-sm">Express Delivery</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="text-blue-700 text-sm">Minimum Order</span>
                  <span className="font-bold text-blue-800">No Minimum!</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-blue-700 text-sm">Service Tax</span>
                  <span className="font-bold text-green-600">Included</span>
                </div>
              </div>
            </div>
          </div>

          {/* City Coverage */}
          <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">Cities We Serve</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {DELIVERY_ZONES.map(zone => (
              <div key={zone.city} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:border-orange-200 transition-colors">
                <p className="font-bold text-gray-900 text-sm">{zone.city}</p>
                <p className="text-xs text-gray-400 mt-1">{zone.time}</p>
                <p className="text-xs text-green-600 font-bold mt-1">{zone.charge}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">⭐ Customer Reviews</h2>
            <p className="text-gray-500 mt-2">What our 50,000+ customers say about us</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex">
                {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-2xl">⭐</span>)}
              </div>
              <span className="font-bold text-gray-900 text-xl">4.8</span>
              <span className="text-gray-400 text-sm">/ 5.0 (12,450 reviews)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {REVIEWS.map(r => (
              <div key={r.name} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${r.color} rounded-full flex items-center justify-center text-white font-bold`}>
                    {r.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.city}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(r.rating)].map((_, i) => <span key={i} className="text-yellow-400 text-xs">⭐</span>)}
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">"{r.review}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section id="support" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">📞 Support & Help</h2>
            <p className="text-gray-500 mt-2">We're here for you 24 hours a day, 7 days a week</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {SUPPORT.map(s => (
              <div key={s.title} className={`${s.color} border rounded-2xl p-5 text-center hover:shadow-md transition-all`}>
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm font-semibold text-gray-700">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h3 className="font-bold text-gray-800 text-xl mb-6 text-center">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {[
                { q: 'Is delivery really free?', a: 'Yes! All deliveries are completely free — no hidden charges, no minimum order.' },
                { q: 'How fast is the delivery?', a: 'Our average delivery time is 28 minutes. We guarantee delivery within 45 minutes.' },
                { q: 'Can I track my order live?', a: 'Yes! Once your order is assigned to a driver, you can track their location in real-time on the map.' },
                { q: 'What if my order is late?', a: 'If your order is delayed beyond our guarantee time, you get a full refund — no questions asked.' },
                { q: 'How do I cancel my order?', a: 'You can cancel your order within 5 minutes of placing it. After that, contact our 24/7 support team.' },
                { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, net banking, and cash on delivery.' },
              ].map((faq, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-gray-900 mb-2">❓ {faq.q}</p>
                  <p className="text-gray-600 text-sm">✅ {faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Order? 🚀</h2>
          <p className="text-orange-100 text-lg mb-8">Join 50,000+ happy customers. Free delivery, real-time tracking, 28-minute delivery!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl text-lg hover:shadow-2xl transition-all hover:-translate-y-1">
              🎉 Create Free Account
            </Link>
            <Link to="/login"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-all">
              Already have account? Login →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🚀</span>
                <span className="font-bold text-white text-lg">OrderTracker</span>
              </div>
              <p className="text-sm leading-relaxed">India's fastest food delivery platform with real-time tracking and free delivery.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                {['About Us', 'Careers', 'Blog', 'Press'].map(i => <li key={i}><a href="#" className="hover:text-orange-400 transition-colors">{i}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Cookie Policy'].map(i => <li key={i}><a href="#" className="hover:text-orange-400 transition-colors">{i}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>📞 1800-123-4567</li>
                <li>📧 support@ordertracker.com</li>
                <li>🏢 HITEC City, Hyderabad</li>
                <li>🕐 24/7 Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex justify-between items-center">
            <p className="text-sm">© 2026 OrderTracker. All rights reserved.</p>
            <div className="flex gap-4 text-xl">
              <span className="cursor-pointer hover:scale-125 transition-transform">📘</span>
              <span className="cursor-pointer hover:scale-125 transition-transform">🐦</span>
              <span className="cursor-pointer hover:scale-125 transition-transform">📸</span>
              <span className="cursor-pointer hover:scale-125 transition-transform">▶️</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

