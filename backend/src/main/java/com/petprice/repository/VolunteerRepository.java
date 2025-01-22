package com.petprice.repository;

import com.petprice.entity.Volunteer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {

    @Query("SELECT v FROM Volunteer v " +
            "WHERE (:region IS NULL OR v.region = :region) " +
            "AND (:date IS NULL OR v.startDate <= :date AND v.endDate >= :date) " +
            "AND (:userId IS NULL OR v.user.id = :userId) " +
            "ORDER BY v.createdAt DESC")
    Page<Volunteer> findVolunteers(String region, LocalDate date, Long userId, PageRequest pageRequest);

    List<Volunteer> findByUserId(Long id);

    void deleteByUserId(Long userId);
}
