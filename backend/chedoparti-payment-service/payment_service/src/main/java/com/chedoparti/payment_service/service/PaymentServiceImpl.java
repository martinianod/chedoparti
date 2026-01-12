package com.chedoparti.payment_service.service;

import com.chedoparti.payment_service.dto.*;
import com.chedoparti.payment_service.entity.Payment;
import com.chedoparti.payment_service.entity.Refund;
import com.chedoparti.payment_service.exception.RefundNotFoundException;
import com.chedoparti.payment_service.mapper.PaymentMapper;
import com.chedoparti.payment_service.mapper.RefundMapper;
import com.chedoparti.payment_service.repository.PaymentRepository;
import com.chedoparti.payment_service.repository.RefundRepository;
import com.chedoparti.payment_service.service.factory.PaymentGatewayFactoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService{

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private PaymentGatewayFactoryImpl paymentGatewayFactory;

    @Autowired
    private PaymentMonitoringService paymentMonitoringService;

    @Autowired
    RefundMapper refundMapper;

    @Autowired
    PaymentMapper paymentMapper;

    public PaymentDto createPayment(UUID reservationId, PaymentRequest paymentRequest) {

        // Obtener la pasarela de pagos correcta (por ejemplo, Stripe o PayPal)
        PaymentGateway paymentGateway = paymentGatewayFactory.getPaymentGateway(paymentRequest.getPaymentGateway());

        // Procesar el pago
        PaymentResponse response = paymentGateway.processPayment(paymentRequest);

        // Guardar el pago en la base de datos
        Payment payment = new Payment();
        payment.setReservationId(reservationId);
        payment.setAmount(paymentRequest.getAmount());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentStatus(response.getStatus());
        payment.setPaymentGatewayTransactionId(response.getTransactionId());
        payment.setPaymentMethod(paymentRequest.getPaymentMethod());

        paymentRepository.save(payment);

        if (response.isSuccessful()) {
            paymentMonitoringService.recordSuccessfulPayment();
        } else {
            paymentMonitoringService.recordFailedPayment();
        }

        return paymentMapper.paymentToPaymentDto(payment);
    }

    public RefundDto processRefund(UUID paymentId, RefundRequest refundRequest) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RefundNotFoundException("Payment not found"));

        // Obtener la pasarela de pago correcta
        PaymentGateway paymentGateway = paymentGatewayFactory.getPaymentGateway(refundRequest.getPaymentGateway());

        // Procesar el reembolso
        RefundResponse refundResponse = paymentGateway.processRefund(refundRequest);

        // Guardar la información del reembolso
        Refund refund = new Refund();
        refund.setPayment(payment);
        refund.setRefundAmount(refundRequest.getAmount());
        refund.setRefundDate(LocalDateTime.now());
        refund.setRefundStatus(refundResponse.getStatus());

        refundRepository.save(refund);

        return refundMapper.refundToRefundDto(refund);
    }
}

