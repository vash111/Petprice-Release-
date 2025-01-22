package com.petprice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
public class InquiryResponseDto {
    private Long id;
    private String name;
    private String email;
    private String content;
    private String category;
    private String reply;
    private LocalDateTime createdAt;
    private LocalDateTime repliedAt;
}