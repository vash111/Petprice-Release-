import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient'; // 서버와 통신하는 Axios 인스턴스

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const product = location.state?.product; // 구매 요청한 상품 정보 가져오기

    useEffect(() => {
        if (!product) {
            alert('결제할 상품 정보가 없습니다.');
            navigate('/');
        }
    }, [product, navigate]);

    const handlePayment = () => {
        if (!window.IMP) {
            alert('결제 모듈 로드에 실패했습니다.');
            return;
        }

        // 결제 모듈 초기화
        const IMP = window.IMP;
        IMP.init('imp34601721'); // I'mport 관리자 콘솔에서 발급받은 가맹점 식별코드

        // 결제 요청
        IMP.request_pay(
            {
                pg: 'tosspay', // PG사: 토스페이먼츠
                pay_method: 'card', // 결제 방식: 'card', 'trans', 'vbank' 등
                merchant_uid: `merchant_${new Date().getTime()}`, // 고유 주문번호
                name: product.title, // 상품명
                amount: product.price, // 결제 금액
                buyer_email: 'user@example.com', // 사용자 이메일
                buyer_name: '홍길동', // 사용자 이름
                buyer_tel: '010-1234-5678', // 사용자 전화번호
                buyer_addr: '서울특별시 강남구 테헤란로', // 사용자 주소
                buyer_postcode: '12345', // 사용자 우편번호
            },
            async (response) => {
                if (response.success) {
                    alert('결제가 완료되었습니다.');
                    // 결제 성공 시 서버에 결제 정보를 전달하여 처리
                    await handlePaymentSuccess(response);
                } else {
                    alert(`결제에 실패하였습니다: ${response.error_msg}`);
                }
            }
        );
    };

    const handlePaymentSuccess = async (paymentData) => {
        try {
            // 서버에 결제 정보 전달
            const response = await apiClient.post('/api/payment', {
                paymentData,
                productId: product.id, // 상품 ID
            });
    
            if (response.status === 200) {
                alert('결제가 성공적으로 처리되었습니다.');
                navigate('/'); // 결제 완료 후 메인 페이지로 이동
            } else {
                alert('결제 처리는 완료되었으나, 서버에서 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('결제 처리 중 오류 발생:', error);
            alert('결제 정보를 저장하는 데 실패했습니다.');
        }
    };

    return (
        <div className="payment-page">
            <h1>결제 페이지</h1>
            {product && (
                <div className="product-details">
                    <h2>{product.title}</h2>
                    <p>가격: {product.price.toLocaleString()} 원</p>
                </div>
            )}
            <button onClick={handlePayment} className="pay-button">
                결제하기
            </button>
        </div>
    );
}

export default PaymentPage;
