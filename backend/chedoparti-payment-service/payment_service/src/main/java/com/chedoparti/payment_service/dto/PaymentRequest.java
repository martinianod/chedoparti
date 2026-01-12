package com.chedoparti.payment_service.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PaymentRequest {

    private UUID userId;
    private BigDecimal amount;
    private String currency;
    private String description;
    private String paymentGateway;

}
