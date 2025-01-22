package com.petprice.controller;

import com.petprice.dto.NoticeResponseDto;
import com.petprice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicNoticeController {

    private final NoticeService noticeService;

    // 공지사항 목록 조회 (최대 limit 개수)
    @GetMapping("/notices")
    public ResponseEntity<List<NoticeResponseDto>> getPublicNotices(
            @RequestParam(defaultValue = "3") int limit) {
        List<NoticeResponseDto> notices = noticeService.getLimitedNotices(limit);
        return ResponseEntity.ok(notices);
    }

    // 특정 공지사항 상세 조회
    @GetMapping("/notices/{id}")
    public ResponseEntity<NoticeResponseDto> getNoticeDetail(@PathVariable Long id) {
        NoticeResponseDto notice = noticeService.getNoticeById(id);
        return ResponseEntity.ok(notice);
    }
}