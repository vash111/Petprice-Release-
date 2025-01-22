package com.petprice.controller;

import com.petprice.dto.PaymentRequestDTO;
import com.petprice.entity.Product;
import com.petprice.entity.Transaction;
import com.petprice.entity.User;
import com.petprice.repository.ProductRepository;
import com.petprice.repository.TransactionRepository;
import com.petprice.service.ProductService;
import com.petprice.service.TransactionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final ProductService productService;
    private final TransactionService transactionService;
    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    public PaymentController(ProductService productService, TransactionService transactionService, TransactionRepository transactionRepository, ProductRepository productRepository) {
        this.productService = productService;
        this.transactionService = transactionService;
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<?> processPayment(
            @RequestBody PaymentRequestDTO paymentRequest,
            HttpSession session) {
        User buyer = (User) session.getAttribute("user");
        if (buyer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
        }

        try {
            // 상품 ID와 결제 데이터를 사용해 거래 저장
            transactionService.saveTransaction(paymentRequest, buyer);
            return ResponseEntity.ok("결제가 성공적으로 처리되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("결제 처리 실패: " + e.getMessage());
        }
    }

    @Transactional
    public void saveTransaction(PaymentRequestDTO paymentRequest, User buyer) {
        Product product = productRepository.findById(paymentRequest.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // Transaction 생성 및 저장
        Transaction transaction = new Transaction(
                product,
                buyer,
                product.getSeller(),
                "결제 완료" // 상태
        );

        // 양방향 관계 설정
        product.setBuyer(buyer);
        product.setStatus("판매 완료");
        product.getTransactions().add(transaction);

        transactionRepository.save(transaction);
        productRepository.save(product); // 상품 상태 업데이트
    }


}
