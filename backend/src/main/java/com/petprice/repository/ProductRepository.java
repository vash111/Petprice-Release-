package com.petprice.repository;

import com.petprice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findBySellerId(Long sellerId); // 판매자별 상품 조회

    List<Product> findByStatus(String status); // 상태별 상품 조회

    List<Product> findByCategory(String category); // 카테고리별 상품 조회

    @Query("SELECT p FROM Product p JOIN p.likedUsers u WHERE u.id = :userId")

    List<Product> findLikedProductsByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId AND p.status IN :statuses")
    List<Product> findBySellerIdAndStatuses(@Param("sellerId") Long sellerId, @Param("statuses") List<String> statuses);

    Optional<Product> findById(Long id);
}
