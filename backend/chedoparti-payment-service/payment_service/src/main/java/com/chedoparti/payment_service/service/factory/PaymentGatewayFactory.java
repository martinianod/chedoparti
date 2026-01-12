package com.chedoparti.payment_service.service.factory;

import com.chedoparti.payment_service.dto.PaymentMethod;
import com.chedoparti.payment_service.enums.EPayment;

public interface PaymentGatewayFactory {
    PaymentMethod createPaymentMethod(EPayment ePayment);
}
