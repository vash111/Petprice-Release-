package com.petprice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

//FreeBoard 댓글 dto
@Getter @Setter
public class CommentDTO {
    private Long id;
    private String content;
    private String authorUsername;
    private LocalDateTime createdAt;
    private LocalDateTime repliedAt;
}
