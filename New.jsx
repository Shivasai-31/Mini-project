
import React, { useState, useEffect, useContext, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const ProductContext = createContext();

const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async (category = "science") => {
    try {
      const res = await fetch(`https://openlibrary.org/subjects/${category}.json`);
      const data = await res.json();
      const localProducts = data.works.map((item) => ({
        id: item.key,
        title: item.title,
        authors: item.authors?.map((a) => a.name).join(", ") || "Unknown",
        image: item.cover_id
          ? `https://covers.openlibrary.org/b/id/${item.cover_id}-M.jpg`
          : "https://via.placeholder.com/100x150?text=No+Cover",
        status: "Saved",
      }));
      setProducts(localProducts);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const addProduct = (product) => {
    setProducts((prev) => [...prev, { ...product, id: Date.now().toString() }]);
  };

  const updateProduct = (updated) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ProductContext.Provider
      value={{ products, fetchProducts, addProduct, updateProduct, deleteProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
};

const Home = () => {
  const { products, deleteProduct, updateProduct, addProduct } = useContext(ProductContext);

  // Images to cycle through on Add button or image click
  const imageLinks = [
    "https://via.placeholder.com/100x150/FF6B6B/FFFFFF?text=Book+1",
    "https://via.placeholder.com/100x150/4ECDC4/FFFFFF?text=Book+2", 
    "https://via.placeholder.com/100x150/45B7D1/FFFFFF?text=Book+3",
    "https://via.placeholder.com/100x150/96CEB4/FFFFFF?text=Book+4",
    "https://via.placeholder.com/100x150/FFEAA7/000000?text=Book+5",
    "https://via.placeholder.com/100x150/DDA0DD/000000?text=Book+6",
  ];

  // Get next image URL from the array, cycling back to start
  const getNextImage = (currentImage) => {
    const currentIndex = imageLinks.indexOf(currentImage);
    const nextIndex = currentIndex === -1 || currentIndex === imageLinks.length - 1 ? 0 : currentIndex + 1;
    return imageLinks[nextIndex];
  };

  // Get a random image for new products
  const getRandomImage = () => {
    return imageLinks[Math.floor(Math.random() * imageLinks.length)];
  };

  const handleAddWithImageChange = (originalProduct) => {
    // Create a new product with a different image
    const newImage = originalProduct.image && imageLinks.includes(originalProduct.image) 
      ? getNextImage(originalProduct.image)
      : getRandomImage();
    
    const newProduct = {
      ...originalProduct,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More unique ID
      title: `${originalProduct.title} (Copy)`,
      image: newImage,
    };
    
    addProduct(newProduct);
  };

  return (
    <div style={{ 
      padding: 20, 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>📘 Product Library</h2>
        <Link 
          to="/add" 
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            textDecoration: 'none',
            borderRadius: '5px',
            display: 'inline-block',
            marginBottom: '20px'
          }}
        >
          ➕ Add New Product
        </Link>

        {products.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '2px dashed #ddd'
          }}>
            <p style={{ fontSize: '18px' }}>No products found.</p>
            <p>Click "Add New Product" to get started!</p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {products.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0 }}>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      width={100}
                      height={150}
                      style={{ 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: '2px solid #eee',
                        transition: 'border-color 0.2s'
                      }}
                      onClick={() => {
                        const newImage = getNextImage(item.image);
                        updateProduct({ ...item, image: newImage });
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#4CAF50';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#eee';
                      }}
                      title="Click to change image"
                    />
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: '0 0 10px 0', 
                    color: '#333',
                    fontSize: '18px',
                    lineHeight: '1.3'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ 
                    margin: '0 0 15px 0', 
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    <strong>Authors:</strong> {item.authors}
                  </p>
                  <span style={{
                    backgroundColor: '#e8f5e8',
                    color: '#2e7d32',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
              
              <div style={{ 
                marginTop: '20px', 
                display: 'flex', 
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <Link 
                  to={`/edit/${item.id}`}
                  style={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    padding: '8px 16px',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  ✏️ Edit
                </Link>
                
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this product?')) {
                      deleteProduct(item.id);
                    }
                  }}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  🗑️ Delete
                </button>
                
                <button
                  onClick={() => handleAddWithImageChange(item)}
                  style={{
                    backgroundColor: '#FF9800',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#F57C00';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#FF9800';
                  }}
                  title="Create a copy with a different image"
                >
                  🔄 Add 
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
       
const AddProduct = () => {
  const { addProduct } = useContext(ProductContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState({ 
    title: "", 
    authors: "", 
    image: "https://via.placeholder.com/100x150/4ECDC4/FFFFFF?text=New+Book", 
    status: "Saved" 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product.title.trim()) return alert("Title is required");
    addProduct(product);
    navigate("/");
  };

  return (
    <div style={{ 
      padding: 20, 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>➕ Add New Product</h2>
        
        <Link 
          to="/" 
          style={{
            color: '#666',
            textDecoration: 'none',
            marginBottom: '20px',
            display: 'inline-block'
          }}
        >
          ← Back to Products
        </Link>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Title *
            </label>
            <input
              placeholder="Enter product title"
              value={product.title}
              onChange={(e) => setProduct({ ...product, title: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Authors
            </label>
            <input
              placeholder="Enter author names"
              value={product.authors}
              onChange={(e) => setProduct({ ...product, authors: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Image URL
            </label>
            <input
              placeholder="Enter image URL"
              value={product.image}
              onChange={(e) => setProduct({ ...product, image: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            {product.image && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <img 
                  src={product.image} 
                  alt="Preview" 
                  width={100} 
                  height={150}
                  style={{ 
                    borderRadius: '8px',
                    border: '2px solid #eee'
                  }}
                />
              </div>
            )}
          </div>

          <button 
            type="submit"
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '12px 30px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
};

const EditProduct = () => {
  const { id } = useParams();
  const { products, updateProduct } = useContext(ProductContext);
  const navigate = useNavigate();

  const existing = products.find((p) => p.id === id);
  const [product, setProduct] = useState(existing || {});

  useEffect(() => {
    if (!existing) {
      alert('Product not found!');
      navigate("/");
    }
  }, [existing, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!product.title.trim()) return alert("Title is required");
    updateProduct(product);
    navigate("/");
  };

  if (!existing) return null;

  return (
    <div style={{ 
      padding: 20, 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>✏️ Edit Product</h2>
        
        <Link 
          to="/" 
          style={{
            color: '#666',
            textDecoration: 'none',
            marginBottom: '20px',
            display: 'inline-block'
          }}
        >
          ← Back to Products
        </Link>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Title *
            </label>
            <input
              value={product.title}
              onChange={(e) => setProduct({ ...product, title: e.target.value })}
              required
              style={{ 
                width: '100%', 
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Authors
            </label>
            <input
              value={product.authors}
              onChange={(e) => setProduct({ ...product, authors: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Image URL
            </label>
            <input
              value={product.image}
              onChange={(e) => setProduct({ ...product, image: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
            {product.image && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <img 
                  src={product.image} 
                  alt="Preview" 
                  width={100} 
                  height={150}
                  style={{ 
                    borderRadius: '8px',
                    border: '2px solid #eee'
                  }}
                />
              </div>
            )}
          </div>

          <button 
            type="submit"
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '12px 30px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            Update Product
          </button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const { fetchProducts } = useContext(ProductContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Router>
      <div style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px' }}>📚 Product Manager</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.8 }}>
          Manage your book collection with ease
        </p>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/edit/:id" element={<EditProduct />} />
      </Routes>
    </Router>
  );
};

export default function Root() {
  return (
    <ProductProvider>
      <App />
    </ProductProvider>
  );
}