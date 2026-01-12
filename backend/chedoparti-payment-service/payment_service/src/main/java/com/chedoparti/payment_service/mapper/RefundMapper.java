package com.chedoparti.payment_service.mapper;

import com.chedoparti.payment_service.dto.RefundDto;
import com.chedoparti.payment_service.entity.Refund;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface RefundMapper {
    RefundMapper INSTANCE = Mappers.getMapper(RefundMapper.class);

    RefundDto refundToRefundDto(Refund refund);

    Refund refundDtoDtoToRefund(RefundDto refundDtoDto);
}
