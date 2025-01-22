package com.petprice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "volunteer_participants")
@Getter
@Setter
public class VolunteerParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id", nullable = false)
    @JsonIgnore // 순환 참조 방지
    private Volunteer volunteer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // 순환 참조 방지
    private User user;

    @Column(nullable = false)
    private String status = "Pending"; // 참가 상태: Pending, Accepted, Rejected
}
