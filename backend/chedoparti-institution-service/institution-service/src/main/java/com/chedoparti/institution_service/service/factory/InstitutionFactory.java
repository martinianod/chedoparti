package com.chedoparti.institution_service.service.factory;

import com.chedoparti.institution_service.service.PromotionStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class InstitutionFactory {

    private final Map<String, PromotionStrategy> strategies;

    @Autowired
    public InstitutionFactory(List<PromotionStrategy> strategyList) {
        // Construimos el mapa con los tipos de promoción como clave
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(PromotionStrategy::getType, Function.identity()));
    }

    public PromotionStrategy getPromotionStrategy(String promotionType) {
        PromotionStrategy strategy = strategies.get(promotionType);
        if (strategy == null) {
            throw new IllegalArgumentException("Promotion type not supported");
        }
        return strategy;
    }
}


