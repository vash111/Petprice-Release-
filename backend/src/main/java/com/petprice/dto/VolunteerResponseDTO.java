package com.petprice.dto;

import com.petprice.entity.Volunteer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerResponseDTO {
    private Long id;
    private String title;
    private String content;
    private LocalDate startDate;
    private LocalDate endDate;
    private String region;
    private String contact;
    private int currentParticipants;
    private Integer maxParticipants;
    private String username;
    private String status;
}
