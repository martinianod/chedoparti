package com.chedoparti.institution_service.service;

import com.chedoparti.institution_service.dto.PromotionDTO;

import java.util.List;

public interface PromotionService {
    PromotionDTO createPromotion(Long institutionId, PromotionDTO promotionDTO);

    List<PromotionDTO> getPromotionsByInstitution(Long institutionId);

    Double applyPromotionToReservation(Long reservationId, Long promotionId);
}
