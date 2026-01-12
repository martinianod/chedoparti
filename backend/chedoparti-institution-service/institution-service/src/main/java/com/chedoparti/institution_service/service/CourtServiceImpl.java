package com.chedoparti.institution_service.service;

import com.chedoparti.institution_service.dto.CourtDTO;
import com.chedoparti.institution_service.entity.Court;
import com.chedoparti.institution_service.exception.ResourceNotFoundException;
import com.chedoparti.institution_service.mapper.CourtMapper;
import com.chedoparti.institution_service.repository.CourtRepository;
import com.chedoparti.institution_service.repository.InstitutionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourtServiceImpl implements CourtService {

    private final CourtRepository courtRepository;
    private final InstitutionRepository institutionRepository;
    private final CourtMapper courtMapper = CourtMapper.INSTANCE;

    public CourtServiceImpl(CourtRepository courtRepository, InstitutionRepository institutionRepository) {
        this.courtRepository = courtRepository;
        this.institutionRepository = institutionRepository;
    }

    // Obtener todas las canchas de una institución en formato CourtDTO
    public List<CourtDTO> getAllCourtsByInstitution(Long institutionId) {
        List<Court> courts = courtRepository.findByInstitutionId(institutionId);
        return courtMapper.toCourtDTOs(courts);  // Mapea la lista de Court a CourtDTO
    }

    // Obtener una cancha específica en formato CourtDTO
    public CourtDTO getCourtById(Long institutionId, Long courtId) {
        Court court = courtRepository.findByIdAndInstitutionId(courtId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found for this ID"));
        return courtMapper.toCourtDTO(court);  // Mapea Court a CourtDTO
    }

    // Crear una nueva cancha a partir de un CourtDTO
    public CourtDTO createCourt(Long institutionId, CourtDTO courtDTO) {
        Court court = courtMapper.toCourt(courtDTO);  // Mapea CourtDTO a Court
        court.setInstitution(institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution id: " + institutionId + " not found for this ID")));
        Court savedCourt = courtRepository.save(court);
        return courtMapper.toCourtDTO(savedCourt);  // Devuelve el DTO de la cancha creada
    }

    // Actualizar cancha a partir de un CourtDTO
    public CourtDTO updateCourt(Long institutionId, Long courtId, CourtDTO courtDTO) {
        Court court = courtRepository.findByIdAndInstitutionId(courtId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found for this ID"));

        courtMapper.updateCourtFromCourtDto(courtDTO, court);

        Court updatedCourt = courtRepository.save(court);
        return courtMapper.toCourtDTO(updatedCourt);  // Devuelve el DTO actualizado
    }

    @Override
    public void deleteCourt(Long institutionId, Long courtId) {
        Court court = courtRepository.findByIdAndInstitutionId(courtId, institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found for this ID"));
        courtRepository.delete(court);
    }
}
