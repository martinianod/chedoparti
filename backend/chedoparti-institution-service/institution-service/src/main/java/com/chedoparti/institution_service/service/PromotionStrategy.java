package com.chedoparti.institution_service.service;

public interface PromotionStrategy {
    String getType();
    double applyPromotion(Long reservationId);
}
