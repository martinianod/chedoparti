package com.chedoparti.payment_service.mapper;

import com.chedoparti.payment_service.dto.PaymentDto;
import com.chedoparti.payment_service.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentMapper INSTANCE = Mappers.getMapper(PaymentMapper.class);

    PaymentDto paymentToPaymentDto(Payment payment);

    Payment paymentDtoToPayment(PaymentDto paymentDto);
}
