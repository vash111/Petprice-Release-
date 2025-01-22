package com.petprice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionResponseDTO {
    private Long id; // 거래 ID
    private String productTitle; // 상품명
    private int price; // 가격
    private String status; // 상태
    private boolean buyer; // 현재 사용자가 구매자인지 여부
    private String buyerName;
    private String sellerName;
}
