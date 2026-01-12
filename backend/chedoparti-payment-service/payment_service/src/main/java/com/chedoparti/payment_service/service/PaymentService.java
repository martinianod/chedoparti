package com.chedoparti.payment_service.service;

import com.chedoparti.payment_service.dto.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PaymentService {
    RefundDto processRefund(UUID paymentId, RefundRequest refundRequest);

    PaymentDto createPayment(UUID reservationId, PaymentRequest paymentRequest);
}
