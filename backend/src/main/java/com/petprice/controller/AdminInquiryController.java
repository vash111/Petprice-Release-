package com.petprice.controller;

import com.petprice.dto.InquiryResponseDto;
import com.petprice.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController {

    private final InquiryService inquiryService;

    // 관리자: 모든 문의 조회
    @GetMapping
    public ResponseEntity<List<InquiryResponseDto>> getAllInquiries() {
        return ResponseEntity.ok(inquiryService.getAllInquiries());
    }

    // 관리자: 답글 작성
    @PostMapping("/{id}/reply")
    public ResponseEntity<?> addReply(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String reply = payload.get("reply"); // JSON에서 'reply' 필드를 추출
            inquiryService.addReply(id, reply);
            return ResponseEntity.ok("답글이 성공적으로 추가되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 관리자: 답글 수정
    @PostMapping("/{id}/edit-reply")
    public ResponseEntity<?> updateReply(@PathVariable Long id, @RequestBody String reply) {
        try {
            inquiryService.updateReply(id, reply);
            return ResponseEntity.ok("답글이 성공적으로 수정되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}