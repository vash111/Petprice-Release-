package com.petprice.repository;

import com.petprice.entity.VolunteerParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerParticipantRepository extends JpaRepository<VolunteerParticipant, Long> {

    @Query("SELECT p FROM VolunteerParticipant p WHERE p.volunteer.id = :volunteerId")
    List<VolunteerParticipant> findParticipantsByVolunteerId(Long volunteerId);

    boolean existsByVolunteerIdAndUserId(Long volunteerId, Long userId);

    List<VolunteerParticipant> findByUserId(Long id);

    @Query("SELECT p FROM VolunteerParticipant p " +
            "WHERE p.volunteer.id = :volunteerId AND p.user.id = :userId AND p.status = 'Accepted'")
    Optional<VolunteerParticipant> findAcceptedParticipation(@Param("volunteerId") Long volunteerId, @Param("userId") Long userId);

    @Query("SELECT p FROM VolunteerParticipant p WHERE p.user.id = :userId AND p.status = 'Accepted'")
    List<VolunteerParticipant> findAcceptedParticipantsByUserId(@Param("userId") Long userId);

}

