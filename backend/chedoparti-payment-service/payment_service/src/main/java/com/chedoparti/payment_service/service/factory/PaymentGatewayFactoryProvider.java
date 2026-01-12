package com.chedoparti.payment_service.service.factory;

import com.chedoparti.payment_service.enums.EPayment;
import com.chedoparti.payment_service.repository.PaymentRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
@Slf4j
public class PaymentGatewayFactoryProvider {

    private final Map<EPayment, PaymentGatewayFactory> factoryMap = new EnumMap<>(EPayment.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private MercadoPagoFactory mercadoPagoFactory;

    @Autowired
    private BankTransferFactory bankTransferFactory;

    @Autowired
    private DebitCardFactory debitCardFactory;

    @Autowired
    private CreditCardFactory creditCardFactory;

    @PostConstruct
    public void init() {
        paymentRepository.findAll().forEach(payment -> {
            switch (payment.getPaymentMethod()) {
                case "MERCADO_PAGO":
                    factoryMap.put(EPayment.MERCADO_PAGO, mercadoPagoFactory);
                    break;
                case "BANK_TRANSFER":
                    factoryMap.put(EPayment.BANK_TRANSFER, bankTransferFactory);
                    break;
                case "DEBIT_CARD":
                    factoryMap.put(EPayment.DEBIT_CARD, debitCardFactory);
                    break;
                case "CREDIT_CARD":
                    factoryMap.put(EPayment.CREDIT_CARD, creditCardFactory);
                    break;
                default:
                    throw new IllegalArgumentException("Unknown payment method: " + payment.getPaymentMethod());
            }
        });
    }

    public PaymentGatewayFactory getFactory(EPayment ePayment) {
        PaymentGatewayFactory factory = factoryMap.get(ePayment);
        if (factory == null) {
            throw new IllegalArgumentException("Unknown payment method: " + ePayment);
        }
        return factory;
    }
}
