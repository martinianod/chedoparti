package com.chedoparti.institution_service.service.strategy;

import com.chedoparti.institution_service.service.PromotionStrategy;
import org.springframework.stereotype.Service;

@Service
public class TimeBasedPromotionStrategy implements PromotionStrategy {
    @Override
    public String getType() {
        return "TIME_BASED";
    }
    @Override
    public double applyPromotion(Long reservationId) {
        return 0;
    }
}
