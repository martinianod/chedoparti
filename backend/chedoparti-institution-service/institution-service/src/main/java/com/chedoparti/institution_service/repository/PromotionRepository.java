package com.chedoparti.institution_service.repository;

import com.chedoparti.institution_service.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionRepository extends JpaRepository <Promotion, Long> {
}
