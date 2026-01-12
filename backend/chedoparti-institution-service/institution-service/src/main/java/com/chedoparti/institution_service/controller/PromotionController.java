package com.chedoparti.institution_service.controller;

import com.chedoparti.institution_service.dto.PromotionDTO;
import com.chedoparti.institution_service.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions/{institutionId}/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @PostMapping
    public ResponseEntity<PromotionDTO> createPromotion(@PathVariable Long institutionId, @RequestBody PromotionDTO promotionDTO) {
        return ResponseEntity.ok(promotionService.createPromotion(institutionId, promotionDTO));
    }

    @GetMapping
    public ResponseEntity<List<PromotionDTO>> getPromotionsByInstitution(@PathVariable Long institutionId) {
        return ResponseEntity.ok(promotionService.getPromotionsByInstitution(institutionId));
    }

    @PostMapping("/{promotionId}/apply/{reservationId}")
    public ResponseEntity<Double> applyPromotion(@PathVariable Long promotionId, @PathVariable Long reservationId) {
        return ResponseEntity.ok(promotionService.applyPromotionToReservation(reservationId, promotionId));
    }
}
