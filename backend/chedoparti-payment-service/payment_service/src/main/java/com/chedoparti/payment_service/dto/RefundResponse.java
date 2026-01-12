package com.chedoparti.payment_service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class RefundResponse {
    private UUID transactionId;
    private BigDecimal amount;
    private String currency;
    private String status;
}
