package com.petprice.repository;

import com.petprice.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByBuyerIdOrSellerId(Long buyerId, Long sellerId);

    @Query("SELECT t FROM Transaction t WHERE t.seller.id = :sellerId AND t.status IN :statuses")
    List<Transaction> findBySellerIdAndStatuses(@Param("sellerId") Long sellerId, @Param("statuses") List<String> statuses);

    Optional<Transaction> findById(Long id);
}
