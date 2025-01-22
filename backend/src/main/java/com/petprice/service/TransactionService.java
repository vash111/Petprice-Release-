package com.petprice.service;

import com.petprice.dto.PaymentRequestDTO;
import com.petprice.dto.TransactionResponseDTO;
import com.petprice.entity.Product;
import com.petprice.entity.Transaction;
import com.petprice.entity.User;
import com.petprice.repository.ProductRepository;
import com.petprice.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    public TransactionService(TransactionRepository transactionRepository, ProductRepository productRepository) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getTransactionHistory(User user) {
        // 사용자 ID를 기준으로 거래 내역 조회
        List<Transaction> transactions = transactionRepository.findByBuyerIdOrSellerId(user.getId(), user.getId());

        // 거래 내역을 DTO로 변환
        return transactions.stream()
                .map(transaction -> convertToDTO(transaction, user))
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelPurchase(Long transactionId, User buyer) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("거래를 찾을 수 없습니다."));

        if (!transaction.getBuyer().getId().equals(buyer.getId())) {
            throw new SecurityException("권한이 없습니다.");
        }

        if (!transaction.getStatus().equals("구매 신청")) {
            throw new IllegalStateException("취소할 수 없는 상태입니다.");
        }

        transaction.setStatus("취소됨");
        Product product = transaction.getProduct();
        product.setStatus("판매 중");
        product.setBuyer(null);

        transactionRepository.save(transaction);
        productRepository.save(product);
    }

    @Transactional
    public void saveTransaction(PaymentRequestDTO paymentRequest, User buyer) {
        // 1. 상품 정보 가져오기
        Product product = productRepository.findById(paymentRequest.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 2. 상품이 이미 판매 완료인지 확인
        if ("판매 완료".equals(product.getStatus())) {
            throw new IllegalStateException("이미 판매 완료된 상품입니다.");
        }

        // 3. Transaction 생성
        Transaction transaction = new Transaction(
                product,
                buyer,                 // 구매자
                product.getSeller(),   // 판매자
                "결제 완료"             // 상태 설정
        );

        // 4. 양방향 관계 설정
        product.setBuyer(buyer);
        product.setStatus("판매 완료"); // 상품 상태 변경
        product.getTransactions().add(transaction);

        // 5. 저장
        transactionRepository.save(transaction); // 거래 내역 저장
        productRepository.save(product);         // 상품 상태 저장
    }

    // 판매 내역 조회
    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getSalesHistory(User seller) {
        // 판매자 ID를 기준으로 거래 상태가 '결제 완료' 또는 '판매 완료'인 거래 내역 조회
        List<Transaction> transactions = transactionRepository.findBySellerIdAndStatuses(seller.getId(), List.of("결제 완료", "판매 완료"));

        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    //판매 승인,거절
    @Transactional
    public void processPurchaseRequest(Long transactionId, boolean approve, User seller) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("거래를 찾을 수 없습니다."));

        // 권한 확인: 현재 사용자가 판매자인지 검증
        if (!transaction.getSeller().getId().equals(seller.getId())) {
            throw new SecurityException("권한이 없습니다.");
        }

        if (!transaction.getStatus().equals("구매 신청")) {
            throw new IllegalStateException("구매 신청 상태가 아닌 거래는 처리할 수 없습니다.");
        }

        if (approve) {
            // 승인 처리
            transaction.setStatus("결제 완료");

            // 관련 상품 상태 변경
            Product product = transaction.getProduct();
            product.setStatus("판매 완료");
            productRepository.save(product);
        } else {
            // 거절 처리
            transaction.setStatus("거절됨");

            // 상품 상태 초기화
            Product product = transaction.getProduct();
            product.setStatus("판매 중");
            product.setBuyer(null);
            productRepository.save(product);
        }

        // 거래 상태 업데이트
        transactionRepository.save(transaction);
    }


    private TransactionResponseDTO convertToDTO(Transaction transaction, User currentUser) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setId(transaction.getId());
        dto.setProductTitle(transaction.getProduct().getTitle());
        dto.setPrice(transaction.getProduct().getPrice());
        dto.setStatus(transaction.getStatus());
        dto.setBuyer(transaction.getBuyer().getId().equals(currentUser.getId()));
        return dto;
    }

    private TransactionResponseDTO convertToDTO(Transaction transaction) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setId(transaction.getId());
        dto.setProductTitle(transaction.getProduct().getTitle());
        dto.setPrice(transaction.getProduct().getPrice());
        dto.setStatus(transaction.getStatus());
        dto.setBuyerName(transaction.getBuyer().getUsername()); // 구매자 정보 추가
        dto.setSellerName(transaction.getSeller().getUsername()); // 판매자 정보 추가
        return dto;
    }
}
