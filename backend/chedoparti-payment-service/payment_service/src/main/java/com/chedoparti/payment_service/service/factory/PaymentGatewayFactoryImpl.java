package com.chedoparti.payment_service.service.factory;

import com.chedoparti.payment_service.dto.PaymentMethod;
import com.chedoparti.payment_service.enums.EPayment;
import com.chedoparti.payment_service.service.PaymentGateway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentGatewayFactoryImpl implements PaymentGatewayFactory {

    @Override
    public PaymentMethod createPaymentMethod(EPayment ePayment) {
        return null;
    }
}
