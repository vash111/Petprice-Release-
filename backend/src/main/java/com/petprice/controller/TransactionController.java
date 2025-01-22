package com.petprice.controller;

import com.petprice.dto.TransactionResponseDTO;
import com.petprice.entity.User;
import com.petprice.service.TransactionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;


    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<?> getTransactions(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            List<TransactionResponseDTO> transactions = transactionService.getTransactionHistory(user);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("구매/판매 내역 조회 중 오류 발생");
        }
    }

    // 판매 내역 반환
    @GetMapping("/sales")
    public ResponseEntity<?> getSales(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            List<TransactionResponseDTO> sales = transactionService.getSalesHistory(user);
            return ResponseEntity.ok(sales);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("판매 내역 조회 중 오류 발생: " + e.getMessage());
        }
    }

    //구매 요청 승인,거절
    @PostMapping("/{transactionId}/approve")
    public ResponseEntity<?> approvePurchase(
            @PathVariable Long transactionId,
            @RequestBody Map<String, Boolean> request,
            HttpSession session) {
        User seller = (User) session.getAttribute("user");
        if (seller == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        boolean approve = request.getOrDefault("approve", false);

        try {
            transactionService.processPurchaseRequest(transactionId, approve, seller);
            return ResponseEntity.ok(approve ? "구매 요청이 승인되었습니다." : "구매 요청이 거절되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("구매 요청 처리 실패: " + e.getMessage());
        }
    }


}
