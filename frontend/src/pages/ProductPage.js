import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import '../components/styles/ProductPage.css';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

function ProductPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stompClient, setStompClient] = useState(null); // Stomp Client 추가
    const [currentUser, setCurrentUser] = useState(null); // 로그인된 사용자 정보 추가
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchCurrentUser(); // 로그인된 사용자 정보 가져오기
        initializeWebSocket();
    }, []);

    const initializeWebSocket = () => {
        const socket = new SockJS('/ws');
        const client = Stomp.over(socket);
        client.connect({}, () => {
            setStompClient(client);
        });
    };

    const fetchProducts = async () => {
        try {
            const response = await apiClient.get('/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('상품 목록을 가져오는 중 오류 발생:', error);
            alert('상품 목록을 불러오지 못했습니다.');
        }
    };

    const fetchCategories = async () => {
        try {
            setCategories(['전체', '사료', '간식', '장난감', '목줄 및 하네스', '배변 용품', '기타']);
        } catch (error) {
            console.error('카테고리를 가져오는 중 오류 발생:', error);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await apiClient.get('/api/users/session'); // 현재 세션 정보를 가져오는 API 호출
            setCurrentUser(response.data);
        } catch (error) {
            console.error('현재 사용자 정보를 가져오는 중 오류 발생:', error);
        }
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
    };

    const handleToggleLike = async (productId) => {
        try {
            await apiClient.post(`/api/products/${productId}/like`);
            fetchProducts();
        } catch (error) {
            console.error('찜 기능 처리 중 오류 발생:', error);
            alert('찜하기에 실패했습니다.');
        }
    };

    const handleBuyProduct = async () => {
        if (!selectedProduct) return;

        try {
            await apiClient.post(`/api/products/${selectedProduct.id}/purchase-request`);
            alert('구매 요청이 성공적으로 전송되었습니다.');
            navigate('/payment', { state: { product: selectedProduct } }); // 결제 페이지로 이동
        } catch (error) {
            console.error('구매 요청 중 오류 발생:', error);
            alert('구매 요청에 실패했습니다.');
        }
    };

    const handleSellProduct = () => {
        navigate('/sell-product');
    };

    const handleChatStart = async () => {
        if (!stompClient || !selectedProduct || !currentUser) {
            alert('채팅을 시작할 수 없습니다. 연결 상태 또는 사용자 정보를 확인해주세요.');
            return;
        }

        const roomKey = `${selectedProduct.id}-${selectedProduct.sellerId}`;
        const buyerId = currentUser.id;

        console.log('채팅방 생성 요청 데이터:', {
            productId: selectedProduct.id,
            userId: buyerId,
        });

        try {
            const response = await apiClient.post('/api/chats/create', {
                productId: selectedProduct.id,
                userId: buyerId,
            });

            stompClient.send(
                '/app/chat.start',
                {},
                JSON.stringify({
                    room: roomKey,
                    productId: selectedProduct.id,
                    sellerId: selectedProduct.sellerId,
                    buyerId: buyerId,
                })
            );

            alert(`채팅방이 생성되었습니다. 방 키: ${response.data}`);
            navigate(`/chat/${roomKey}`);
        } catch (error) {
            console.error('채팅방 생성 요청 실패:', error);
            alert('채팅방 생성에 실패했습니다.');
        }
    };

    const filteredProducts = products.filter(
        (product) =>
            (selectedCategory === '전체' || product.category === selectedCategory || selectedCategory === '') &&
            product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="product-page">
            <div className="top-bar">
                <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                <button onClick={handleSellProduct} className="sell-button">
                    내 상점
                </button>
            </div>

            <div className="product-grid">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="product-card"
                        onClick={() => handleProductClick(product)}
                    >
                        <img
                            src={product.imageUrl || '/placeholder.png'}
                            alt={product.title}
                            className="product-image"
                        />
                        <h3 className="product-title">{product.title}</h3>
                        <p className="product-price">{product.price.toLocaleString()} 원</p>
                    </div>
                ))}
            </div>

            {isModalOpen && selectedProduct && (
                <div className="modal">
                    <div className="modal-content">
                        <img
                            src={selectedProduct.imageUrl || '/placeholder.png'}
                            alt={selectedProduct.title}
                            className="modal-image"
                        />
                        <h2 className="modal-title">{selectedProduct.title}</h2>
                        <p className="modal-date">등록일: {new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                        <p className="modal-price">{selectedProduct.price.toLocaleString()} 원</p>
                        <p className="modal-description">{selectedProduct.description}</p>
                        <p className="modal-status">
                            <span className={`status-badge ${selectedProduct.status.toLowerCase().replace(' ', '-')}`}>
                                {selectedProduct.status}
                            </span>
                        </p>
                        <div className="modal-actions">
                            <button
                                onClick={() => handleToggleLike(selectedProduct.id)}
                                className="like-button"
                            >
                                {selectedProduct.likedByUser ? '찜 취소' : '찜하기'}
                            </button>
                            <button onClick={handleBuyProduct} className="buy-button">
                                구매하기
                            </button>
                            <button onClick={handleChatStart} className="chat-button">
                                1대1 대화
                            </button>
                        </div>
                        <button className="close-button" onClick={closeModal}>
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductPage;
