package com.petprice.dto;

import lombok.Data;

import java.util.Map;

@Data
public class PaymentRequestDTO {
    private Long productId; // 결제한 상품 ID
    private Map<String, Object> paymentData; // 결제 정보
}
