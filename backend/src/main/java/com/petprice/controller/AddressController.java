package com.petprice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/address")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AddressController {

    private final String apiKey = "devU01TX0FVVEgyMDI1MDExMDE1NTkyMjExNTM5NTI="; // api 키

    @GetMapping("/search")
    public ResponseEntity<?> searchAddress(@RequestParam String keyword,
                                           @RequestParam(defaultValue = "1") int currentPage,
                                           @RequestParam(defaultValue = "10") int countPerPage) {
        String url = "https://www.juso.go.kr/addrlink/addrLinkApi.do?" +
                "confmKey=" + apiKey +
                "&currentPage=" + currentPage +
                "&countPerPage=" + countPerPage +
                "&keyword=" + keyword +
                "&resultType=json";

        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.getForObject(url, String.class);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/addressCallback") // POST 요청 처리로 변경
    public ResponseEntity<?> handleAddressCallback(
            @RequestParam("roadAddr") String roadAddr,
            @RequestParam("jibunAddr") String jibunAddr,
            @RequestParam("zipNo") String zipNo) {

        // 전달받은 데이터 출력 (로깅 또는 검증)
        System.out.println("도로명 주소: " + roadAddr);
        System.out.println("지번 주소: " + jibunAddr);
        System.out.println("우편번호: " + zipNo);

        // 처리 완료 후 클라이언트에 응답
        return ResponseEntity.ok("주소 데이터 처리 완료");
    }
}
