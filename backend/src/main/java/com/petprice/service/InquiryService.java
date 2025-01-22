package com.petprice.service;

import com.petprice.dto.InquiryResponseDto;
import com.petprice.entity.Inquiry;
import com.petprice.repository.InquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;

    // 사용자: 특정 사용자의 문의만 조회
    public List<InquiryResponseDto> getUserInquiries(String email) {
        return inquiryRepository.findByEmail(email).stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    // 사용자: 문의 저장
    public Inquiry saveInquiry(Inquiry inquiry) {
        return inquiryRepository.save(inquiry);
    }

    // 관리자: 모든 문의 조회
    public List<InquiryResponseDto> getAllInquiries() {
        return inquiryRepository.findAll().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    // 관리자: 답글 추가
    public Inquiry addReply(Long id, String reply) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다."));
        inquiry.setReply(reply);
        inquiry.setRepliedAt(LocalDateTime.now());
        return inquiryRepository.save(inquiry);
    }

    // 관리자: 답글 수정
    public Inquiry updateReply(Long id, String reply) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다."));
        if (inquiry.getReply() == null || inquiry.getReply().isEmpty()) {
            throw new IllegalStateException("답글이 존재하지 않아 수정할 수 없습니다.");
        }
        inquiry.setReply(reply);
        inquiry.setRepliedAt(LocalDateTime.now());
        return inquiryRepository.save(inquiry);
    }

    // DTO 변환
    private InquiryResponseDto convertToResponseDto(Inquiry inquiry) {
        InquiryResponseDto dto = new InquiryResponseDto();
        dto.setId(inquiry.getId());
        dto.setName(inquiry.getName());
        dto.setEmail(inquiry.getEmail());
        dto.setContent(inquiry.getContent());
        dto.setCategory(inquiry.getCategory());
        dto.setReply(inquiry.getReply());
        dto.setCreatedAt(inquiry.getCreatedAt());
        dto.setRepliedAt(inquiry.getRepliedAt());
        return dto;
    }


}