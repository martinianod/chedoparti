package com.chedoparti.institution_service.repository;

import com.chedoparti.institution_service.entity.Court;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourtRepository extends JpaRepository<Court, Long> {
    List<Court> findByInstitutionId(Long institutionId);
    Optional<Court> findByIdAndInstitutionId(Long courtId, Long institutionId);
}