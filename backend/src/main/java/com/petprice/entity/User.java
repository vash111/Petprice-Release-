package com.petprice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.petprice.constant.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = true)
    private String roadAddr; // 도로명 주소

    @Column(nullable = true)
    private String jibunAddr; // 지번 주소

    @Column(nullable = true)
    private String zipNo; // 우편번호

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false; // 소프트 삭제 여부

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_temp_password", nullable = false)
    private boolean isTempPassword = false; // 임시 비밀번호 여부

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Product> products = new ArrayList<>(); // 사용자가 등록한 상품

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<VolunteerReview> reviews = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ReviewComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Transaction> transactionsAsBuyer = new ArrayList<>(); // 구매한 거래

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Transaction> transactionsAsSeller = new ArrayList<>(); // 판매한 거래

    // 소프트 삭제
    public void setIsDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}
