package com.petprice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // 상품 제목

    @Column(nullable = false, length = 1000)
    private String description; // 상품 설명

    @Column(nullable = false)
    private int price; // 상품 가격

    @Column(nullable = true)
    private String imageUrl; // 상품 이미지 경로

    @Column(nullable = false)
    private String status = "판매 중"; // 상품 상태

    @Column(nullable = false)
    private String category; // 상품 카테고리

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller; // 판매자 정보

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = true)
    private User buyer; // 구매자 정보

    @ManyToMany
    @JoinTable(
            name = "product_likes",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> likedUsers = new ArrayList<>(); // 찜한 사용자 목록

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions = new ArrayList<>(); // 거래 내역

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // 생성일자
}
