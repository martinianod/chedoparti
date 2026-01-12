package com.chedoparti.institution_service.service;

import com.chedoparti.institution_service.dto.PromotionDTO;
import com.chedoparti.institution_service.entity.Promotion;
import com.chedoparti.institution_service.exception.ResourceNotFoundException;
import com.chedoparti.institution_service.mapper.PromotionMapper;
import com.chedoparti.institution_service.repository.InstitutionRepository;
import com.chedoparti.institution_service.repository.PromotionRepository;
import com.chedoparti.institution_service.service.factory.PromotionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class PromotionServiceImpl implements PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    private PromotionFactory promotionFactory;

    @Autowired
    PromotionMapper promotionMapper;

    @Override
    public PromotionDTO createPromotion(Long institutionId, PromotionDTO promotionDto) {
        // Crear una nueva promoción para la institución
        Promotion promotion = new Promotion();
        promotion.setName(promotionDto.getName());
        promotion.setDescription(promotionDto.getDescription());
        promotion.setDiscountPercentage(promotionDto.getDiscountPercentage());
        promotion.setStartDate(promotionDto.getStartDate());
        promotion.setEndDate(promotionDto.getEndDate());
        promotion.setPromotionType(promotionDto.getPromotionType());
        promotion.setInstitution(institutionRepository.findById(institutionId).orElseThrow(() -> new ResourceNotFoundException("Institution not found")));
        promotionRepository.save(promotion);
        return promotionMapper.promotionToPromotionDTO(promotion);
    }

    /*public double applyPromotionToReservation(Long reservationId, Long promotionId) {
        // Aplicar la promoción a una reserva
        Reservation reservation = reservationService.getReservationById(reservationId);
        Promotion promotion = promotionRepository.findById(promotionId).orElseThrow(() -> new ResourceNotFoundException("Promotion not found"));

        PromotionStrategy strategy = promotionFactory.getPromotionStrategy(promotion.getPromotionType());
        double discount = strategy.applyPromotion();

        // Registrar la aplicación de la promoción
        PromotionApplication promotionApplication = new PromotionApplication();
        promotionApplication.setPromotion(promotion);
        promotionApplication.setReservation(reservation);
        promotionApplication.setDiscountApplied(discount);
        promotionApplication.setAppliedAt(LocalDateTime.now());
        promotionApplicationRepository.save(promotionApplication);

        return discount;
    }*/

    @Override
    public Double applyPromotionToReservation(Long reservationId, Long promotionId) {
        return 0.0;
    }

    @Override
    public List<PromotionDTO> getPromotionsByInstitution(Long institutionId) {
        List<Promotion> promotions = promotionRepository.findAllById(Collections.singleton(institutionId));
        return promotionMapper.promotionsToPromotionDTOs(promotions);
    }


}

