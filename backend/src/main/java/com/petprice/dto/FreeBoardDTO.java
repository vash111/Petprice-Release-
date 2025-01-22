package com.petprice.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
public class FreeBoardDTO {
    private Long id;
    private String title;
    private String content;
    private String category;
    private String imageUrl;
    private String authorUsername;
    private int views;
    private int likes;
    private LocalDateTime createdAt;
    private LocalDateTime repliedAt;
    private List<CommentDTO> comments;
    private boolean likedByUser; // 좋아요 여부
}
