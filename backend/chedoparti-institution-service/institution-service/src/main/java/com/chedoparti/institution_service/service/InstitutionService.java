package com.chedoparti.institution_service.service;

import com.chedoparti.institution_service.dto.InstitutionDTO;

import java.util.List;

public interface InstitutionService {

    InstitutionDTO createInstitution(InstitutionDTO institutionDto);

    List<InstitutionDTO> getAllInstitutions();

    InstitutionDTO getInstitutionById(Long institutionId);

    InstitutionDTO updateInstitution(Long institutionId, InstitutionDTO institutionDTO);

    void deleteInstitution(Long institutionId);
}
