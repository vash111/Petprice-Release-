package com.petprice.controller;

import com.petprice.dto.InquiryDto;
import com.petprice.entity.Inquiry;
import com.petprice.entity.User;
import com.petprice.service.InquiryService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class UserInquiryController {

    private final InquiryService inquiryService;

    // 사용자: 문의 등록
    @PostMapping
    public ResponseEntity<?> createInquiry(@RequestBody InquiryDto inquiryDto, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        Inquiry inquiry = new Inquiry();
        inquiry.setName(user.getUsername());
        inquiry.setEmail(user.getEmail());
        inquiry.setContent(inquiryDto.getContent());
        inquiry.setCategory(inquiryDto.getCategory());
        inquiryService.saveInquiry(inquiry);

        return ResponseEntity.ok("문의가 성공적으로 등록되었습니다.");
    }

    // 사용자: 본인의 문의 조회
    @GetMapping
    public ResponseEntity<?> getUserInquiries(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        return ResponseEntity.ok(inquiryService.getUserInquiries(user.getEmail()));
    }

}