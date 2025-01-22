package com.petprice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ProductResponseDTO {
    private Long id; // 상품 ID
    private String title; // 상품 제목
    private String description; // 상품 설명
    private int price; // 상품 가격
    private String imageUrl; // 상품 이미지 경로
    private String status; // 상품 상태
    private String category; // 상품 카테고리
    private String sellerUsername; // 판매자 이름
    private boolean likedByUser; // 현재 사용자가 찜했는지 여부
    private LocalDateTime createdAt; // 생성일자
    private Long sellerId;
    private Long buyerId;
}
