package com.petprice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

//봉사후기 댓글 dto
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewCommentDTO {
    private Long id;
    private Long reviewId;
    private String username;
    private String content;
    private Long userId;
    private LocalDateTime createdAt;
}