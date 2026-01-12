package com.chedoparti.institution_service.service;

import com.chedoparti.institution_service.dto.InstitutionDTO;
import com.chedoparti.institution_service.entity.Institution;
import com.chedoparti.institution_service.exception.ResourceNotFoundException;
import com.chedoparti.institution_service.mapper.InstitutionMapper;
import com.chedoparti.institution_service.repository.InstitutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionServiceImpl implements InstitutionService {

    @Autowired
    private InstitutionRepository institutionRepository;

    @Autowired
    InstitutionMapper institutionMapper;

    @Autowired
    private PromotionStrategy promotionStrategy;  // Patrón Strategy para promociones

    @Override
    public InstitutionDTO createInstitution(InstitutionDTO institutionDTO) {

        Institution institution = institutionRepository.save(institutionMapper.institutionDTOToInstitution(institutionDTO));
        return institutionMapper.institutionToInstitutionDTO(institution);
    }

    @Override
    public InstitutionDTO updateInstitution(Long id, InstitutionDTO institutionDTO) {
        Institution institution = institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution with id:" + id + "not found"));

        // 2. Usar el mapper para actualizar la entidad
        institutionMapper.updateInstitutionFromDto(institutionDTO, institution);

        return institutionMapper.institutionToInstitutionDTO(
                institutionRepository.save(institutionMapper.institutionDTOToInstitution(institutionDTO)));
    }

    @Override
    public void deleteInstitution(Long id) {
        institutionRepository.deleteById(id);
    }

    @Override
    public InstitutionDTO getInstitutionById(Long institutionId) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution with id: " + institutionId + " not found."));
        return institutionMapper.institutionToInstitutionDTO(institution);
    }

    @Override
    public List<InstitutionDTO> getAllInstitutions() {
        List<Institution> institutions = institutionRepository.findAll();
        return institutionMapper.institutionsToInstitutionDTOs(institutions);
    }
}
