package com.chedoparti.institution_service.mapper;

import com.chedoparti.institution_service.dto.PromotionDTO;
import com.chedoparti.institution_service.entity.Promotion;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PromotionMapper {
    PromotionMapper INSTANCE = Mappers.getMapper(PromotionMapper.class);

    PromotionDTO promotionToPromotionDTO(Promotion promotion);

    Promotion promotionDTOToPromotion(PromotionDTO promotionDTO);

    List<PromotionDTO> promotionsToPromotionDTOs(List<Promotion> promotions);

    List<Promotion> promotionDTOsToPromotions(List<PromotionDTO> promotionDTOs);
}
