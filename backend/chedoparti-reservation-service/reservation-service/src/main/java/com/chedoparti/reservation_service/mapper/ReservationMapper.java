package com.chedoparti.reservation_service.mapper;

import com.chedoparti.reservation_service.dto.ReservationDTO;
import com.chedoparti.reservation_service.entity.Reservation;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReservationMapper {
    ReservationMapper INSTANCE = Mappers.getMapper(ReservationMapper.class);

    ReservationDTO toDto(Reservation reservation);

    Reservation fromDTO(ReservationDTO reservationDTO);

    List<ReservationDTO> toDtos(List<Reservation> reservations);
}
