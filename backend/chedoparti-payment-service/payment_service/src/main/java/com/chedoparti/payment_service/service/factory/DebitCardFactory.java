package com.chedoparti.payment_service.service.factory;

import com.chedoparti.payment_service.dto.PaymentMethod;
import com.chedoparti.payment_service.enums.EPayment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class DebitCardFactory implements PaymentGatewayFactory{
    @Override
    public PaymentMethod createPaymentMethod(EPayment ePayment) {
        return null;
    }
}

