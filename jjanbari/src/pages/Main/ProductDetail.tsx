// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavigateFunction } from 'react-router-dom';
import { Product } from '../interface/interface';
import { CartItem } from '../interface/interface';
import { useAuth } from '../../Auth/AuthContext';

const ProductDetail = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const { state } = useAuth();
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthContext state:', state);
    fetch(`/product/${productId}`)
      .then((response) => response.json())
      .then((data) => setProduct(data));
  }, [state, productId]);

  const handleAddToCart = async (product: Product, navigate: NavigateFunction) => {
    const quantityInput = document.getElementById(`quantity-${product.product_id}`) as HTMLInputElement;
    const selectedQuantity = quantityInput ? Number(quantityInput.value) : 0;
    const userId = sessionStorage.getItem('user_id') || 'anonymous'; // 로그인하지 않은 경우 'anonymous'
  
    if (!state || !state.isAuthenticated) {
      // 로그인되어 있지 않을 경우, 로그인 페이지로 이동
      navigate('/login');
      return;
    }
  
    if (selectedQuantity > 0) {
      try {
        const cartResponse = await fetch(`http://localhost:3001/cart/${userId}`);
        const cartData: CartItem[] = await cartResponse.json();
  
        // 동일한 product_id를 가진 상품이 있는지 확인합니다.
        const existingItem = cartData.find((item) => item.product_id === product.product_id);
  
        if (existingItem) {
          // 이미 장바구니에 상품이 있을 경우, 수량만 업데이트합니다.
          const updatedQuantity = existingItem.quantity + selectedQuantity;
          await fetch(`http://localhost:3001/cart/${userId}/${product.product_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: updatedQuantity }),
          });
        } else {
          // 장바구니에 상품이 없을 경우, 새로 추가합니다.
          await fetch('http://localhost:3001/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              productId: product.product_id,
              quantity: selectedQuantity,
              price: product.price,
            }),
          });
        }
  
        alert('장바구니에 추가 되었습니다.');
        navigate('/cart');
      } catch (error) {
        console.error(error);
        alert('장바구니 추가에 실패했습니다.');
      }
    } else {
      alert('수량을 선택해주세요.');
    }
  };
  

  const handleBuy = async (product: Product) => {
    const selectedQuantityElement = document.getElementById(`quantity-${product.product_id}`) as HTMLInputElement;
    if (selectedQuantityElement) {
      const selectedQuantity = Number(selectedQuantityElement.value);
      const selectedProduct = { ...product, quantity: selectedQuantity };

      // console.log('Current login state:', state);
  
      // 로그인 상태를 state.state로 확인합니다.
      if (state.isAuthenticated) {
        navigate('/payment', { state: { selectedProduct } });
      } else {
        navigate('/login');
      }
    } else {
      // 요소를 찾지 못한 경우의 오류 처리
      console.error('Selected quantity element not found');
    }
  };

  if (!product) {
    // 상품 정보를 아직 가져오지 못한 경우 로딩 상태를 표시하거나 다른 처리를 할 수 있습니다.
    return <div>Loading...</div>;
  }

  return (
    <div className="product-container">
      <div className="product-item" key={product.name}>
        <img src={product.img} alt={product.name} />
        <div className="product-details">
          <h3>{product.name}</h3>
          <p>가격: {product.price}</p>
          <p>수량: {product.quantity}</p>
          <input type="number" id={`quantity-${product.product_id}`} min="1" max={product.quantity} />
          <button onClick={() => handleAddToCart(product, navigate)}>장바구니</button>
          <button>좋아요</button>
          <button onClick={() => handleBuy(product)}>구매</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
