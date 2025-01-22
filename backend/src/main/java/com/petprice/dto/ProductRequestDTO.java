package com.petprice.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequestDTO {
    private String title; // 상품 제목
    private String description; // 상품 설명
    private int price; // 상품 가격
    private String category; // 상품 카테고리
    private String imageUrl; // 저장된 이미지 경로
}
