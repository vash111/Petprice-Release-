package com.petprice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product; // 거래 상품

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer; // 구매자

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller; // 판매자

    @Column(nullable = false)
    private LocalDateTime transactionDate = LocalDateTime.now(); // 거래 일자

    @Column(nullable = false)
    private String status = "대기 중"; // 거래 상태: 대기 중, 승인, 거절

    // 기본 생성자 (Hibernate를 위해 필요)
    protected Transaction() {}

    // 모든 필드를 초기화하는 생성자
    public Transaction(Product product, User buyer, User seller, String status) {
        this.product = product;
        this.buyer = buyer;
        this.seller = seller;
        this.status = status;
    }
}
