package com.chedoparti.payment_service.controller;

import com.chedoparti.payment_service.dto.*;
import com.chedoparti.payment_service.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/institutions/{institutionId}/reservations/{reservationId}/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDto> createPayment(@PathVariable UUID reservationId, @RequestBody PaymentRequest paymentRequest) {
        return ResponseEntity.ok(paymentService.createPayment(reservationId, paymentRequest));
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<RefundDto> processRefund(@PathVariable UUID paymentId, @RequestBody RefundRequest refundRequest) {
        return ResponseEntity.ok(paymentService.processRefund(paymentId, refundRequest));
    }

    @PostMapping("/split")
    public SplitPaymentResponse splitPayment(@Valid @RequestBody SplitPaymentRequest request) {
        return paymentService.splitPayment(request);
    }

    @GetMapping("/history")
    public ResponseEntity<List<TransactionResponse>> getTransactionHistory(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // Lógica para obtener el historial de transacciones
        List<TransactionResponse> transactions = paymentService.getTransactionHistory(userId, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<TransactionResponse> getTransactionDetails(@PathVariable String transactionId) {
        // Lógica para obtener los detalles de una transacción específica
        TransactionResponse response = paymentService.getTransactionDetails(transactionId);
        return ResponseEntity.ok(response);
    }

}
