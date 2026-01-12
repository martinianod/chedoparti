package com.chedoparti.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefundRequest {
    private UUID transactionId;
    private BigDecimal amount;
    private String currency;
    private String status;
}
