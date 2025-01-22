package com.petprice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VolunteerReviewRequestDTO {
    private String title;
    private String content;
    private String imageUrl;
    private String region;
    private Long volunteerId;
}