package com.chedoparti.payment_service.service;

import com.chedoparti.payment_service.dto.PaymentRequest;
import com.chedoparti.payment_service.dto.PaymentResponse;
import com.chedoparti.payment_service.dto.RefundRequest;
import com.chedoparti.payment_service.dto.RefundResponse;

public interface PaymentGateway {
    PaymentResponse processPayment(PaymentRequest paymentRequest);
    RefundResponse processRefund(RefundRequest refundRequest);
}

