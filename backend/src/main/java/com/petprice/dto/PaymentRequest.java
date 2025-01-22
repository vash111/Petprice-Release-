package com.petprice.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private String impUid; // I'mport 결제 고유 ID
    private String merchantUid; // 주문 번호
    private String payMethod; // 결제 방식
    private int amount; // 결제 금액
    private String buyerName; // 구매자 이름
    private String buyerEmail; // 구매자 이메일
    private Long productId; // 결제와 연결된 상품 ID
}
