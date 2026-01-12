package com.chedoparti.institution_service.mapper;

import com.chedoparti.institution_service.dto.InstitutionDTO;
import com.chedoparti.institution_service.entity.Institution;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InstitutionMapper {
    InstitutionMapper INSTANCE = Mappers.getMapper(InstitutionMapper.class);

    void updateInstitutionFromDto(InstitutionDTO institutionDTO, @MappingTarget Institution institution);

    InstitutionDTO institutionToInstitutionDTO(Institution institution);

    Institution institutionDTOToInstitution(InstitutionDTO promotionDTO);

    List<InstitutionDTO> institutionsToInstitutionDTOs(List<Institution> institutions);

    List<Institution> institutionDTOsToInstitutions(List<InstitutionDTO> institutionDTOs);
}
