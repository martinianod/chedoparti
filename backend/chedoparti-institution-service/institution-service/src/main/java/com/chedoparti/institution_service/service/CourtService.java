package com.chedoparti.institution_service.service;

import com.chedoparti.institution_service.dto.CourtDTO;

import java.util.List;

public interface CourtService {
    List<CourtDTO> getAllCourtsByInstitution(Long institutionId);

    CourtDTO getCourtById(Long institutionId, Long courtId);

    CourtDTO createCourt(Long institutionId, CourtDTO court);

    void deleteCourt(Long institutionId, Long courtId);

    CourtDTO updateCourt(Long institutionId, Long courtId, CourtDTO courtDetails);
}
