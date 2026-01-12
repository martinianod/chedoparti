package com.chedoparti.institution_service.mapper;

import com.chedoparti.institution_service.dto.CourtDTO;
import com.chedoparti.institution_service.entity.Court;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CourtMapper {
    CourtMapper INSTANCE = Mappers.getMapper(CourtMapper.class);

    void updateCourtFromCourtDto(CourtDTO courtDTO, @MappingTarget Court court);

    CourtDTO toCourtDTO(Court court);

    Court toCourt(CourtDTO courtDTO);

    List<CourtDTO> toCourtDTOs(List<Court> courts);

    List<Court> toCourts(List<CourtDTO> courtDTOs);
}
