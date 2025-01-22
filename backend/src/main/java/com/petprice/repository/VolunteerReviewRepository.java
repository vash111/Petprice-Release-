package com.petprice.repository;

import com.petprice.entity.VolunteerReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VolunteerReviewRepository extends JpaRepository<VolunteerReview, Long> {

    @Query("SELECT r FROM VolunteerReview r " +
            "WHERE (:region IS NULL OR r.region = :region) " +
            "AND (:keyword IS NULL OR r.title LIKE %:keyword%)")
    Page<VolunteerReview> findByRegionAndKeyword(
            @Param("region") String region,
            @Param("keyword") String keyword,
            Pageable pageable);

    void deleteByUserId(Long userId);
}