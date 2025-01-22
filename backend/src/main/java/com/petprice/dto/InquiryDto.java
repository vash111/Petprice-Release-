package com.petprice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
public class InquiryDto {
    private String content;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime repliedAt;
}