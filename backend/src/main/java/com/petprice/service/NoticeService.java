package com.petprice.service;

import com.petprice.dto.NoticeResponseDto;
import com.petprice.entity.Notice;
import com.petprice.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    // 공지사항 조회
    public List<NoticeResponseDto> getAllNotices() {
        return noticeRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // 공지사항 상세 조회
    public NoticeResponseDto getNoticeById(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));
        return convertToDto(notice);
    }

    // 공지사항 생성
    public NoticeResponseDto createNotice(Notice notice) {
        Notice savedNotice = noticeRepository.save(notice);
        return convertToDto(savedNotice);
    }

    // 공지사항 수정
    public NoticeResponseDto updateNotice(Long id, Notice updatedNotice) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다."));
        notice.setTitle(updatedNotice.getTitle());
        notice.setContent(updatedNotice.getContent());
        notice.setUpDateTime(LocalDateTime.now());
        Notice savedNotice = noticeRepository.save(notice);
        return convertToDto(savedNotice);
    }

    // 공지사항 삭제
    public void deleteNotice(Long id) {
        if (!noticeRepository.existsById(id)) {
            throw new IllegalArgumentException("공지사항을 찾을 수 없습니다.");
        }
        noticeRepository.deleteById(id);
    }

    // 엔터티 -> DTO 변환
    private NoticeResponseDto convertToDto(Notice notice) {
        return new NoticeResponseDto(
                notice.getId(),
                notice.getTitle(),
                notice.getContent(),
                notice.getCreatedTime(),
                notice.getUpDateTime()
        );
    }

    public List<NoticeResponseDto> getLimitedNotices(int limit) {
        // PageRequest를 사용하여 제한된 수의 공지사항만 조회
        Pageable pageable = PageRequest.of(0, limit);
        return noticeRepository.findAll(pageable).getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}