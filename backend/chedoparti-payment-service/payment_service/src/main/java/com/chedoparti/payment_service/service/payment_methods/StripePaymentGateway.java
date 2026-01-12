package com.chedoparti.payment_service.service.payment_methods;

import com.chedoparti.payment_service.dto.PaymentRequest;
import com.chedoparti.payment_service.dto.PaymentResponse;
import com.chedoparti.payment_service.dto.RefundRequest;
import com.chedoparti.payment_service.dto.RefundResponse;
import com.chedoparti.payment_service.entity.Refund;
import com.chedoparti.payment_service.service.PaymentGateway;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service("StripePaymentGateway")
public class StripePaymentGateway implements PaymentGateway {

    @Override
    public PaymentResponse processPayment(PaymentRequest paymentRequest) {
        // Lógica para procesar el pago a través de la API de Stripe
        Stripe.apiKey = "API_KEY";

        // Crear cargo en Stripe
        Map<String, Object> chargeParams = new HashMap<>();
        chargeParams.put("amount", paymentRequest.getAmount() * 100); // en centavos
        chargeParams.put("currency", "usd");
        chargeParams.put("source", paymentRequest.getToken()); // Token generado en el frontend
        chargeParams.put("description", "Reserva cancha");

        try {
            Charge charge = Charge.create(chargeParams);
            return new PaymentResponse(charge.getId(), "COMPLETED");
        } catch (StripeException e) {
            return new PaymentResponse(null, "FAILED");
        }
    }

    @Override
    public RefundResponse processRefund(RefundRequest refundRequest) {
        // Lógica para procesar el reembolso a través de la API de Stripe
        try {
            Refund refund = Refund.builder()
                    .setCharge(refundRequest.getTransactionId())
                    .setAmount(refundRequest.getAmount())
                    .build();
            return new RefundResponse(refund.getId(), "COMPLETED");
        } catch (StripeException e) {
            return new RefundResponse(null, "FAILED");
        }
    }
}
