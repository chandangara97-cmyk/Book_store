import React from 'react';
import { useStore } from '../context/StoreContext';

export const WishlistView: React.FC = () => {
  const { wishlist, removeFromWishlist, addToCart, setView } = useStore();
  return <main className="wrap collection-page">
    <div className="collection-heading"><span className="eyebrow">YOUR LITTLE COLLECTION</span><h1>My Wishlist <span>♡</span></h1><p>Save the books and playthings you love, then add them to your basket whenever you're ready.</p></div>
    {wishlist.length === 0 ? <section className="empty-state"><div className="empty-emoji">💗</div><h2>Your wishlist is waiting to bloom</h2><p>Tap the heart on any book or toy to keep it here.</p><button className="btn" onClick={() => setView('learning')}>Explore learning books</button></section> : <div className="wishlist-grid">
      {wishlist.map(item => <article className="wishlist-card" key={item.id}>
        <div className="wishlist-art">{item.cover ? <img src={item.cover} alt={item.title} /> : <span>📚</span>}</div>
        <div className="wishlist-copy"><small>{item.category || 'Kiddie Bloom'}</small><h3>{item.title}</h3><p>₹{Number(item.price).toLocaleString('en-IN')}</p>
          <div className="wishlist-actions"><button className="btn" onClick={() => { addToCart({ id: item.id, title: item.title, author: item.author || 'Kiddie Bloom', price: item.price, cover: item.cover || '', category: item.category || 'children', type: item.type || 'book' }); }}>Add to cart</button><button className="btn btn-light" onClick={() => removeFromWishlist(item.id)}>Remove</button></div>
        </div>
      </article>)}
    </div>}
  </main>;
};
