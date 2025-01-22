package com.petprice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VolunteerReviewDTO {
    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private String region;
    private int views;
    private String username; // 작성자
    private Long userId;
    private LocalDateTime createdAt;
    private List<ReviewCommentDTO> comments;

}

