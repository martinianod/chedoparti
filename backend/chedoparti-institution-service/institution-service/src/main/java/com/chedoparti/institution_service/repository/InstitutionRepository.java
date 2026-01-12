package com.chedoparti.institution_service.repository;

import com.chedoparti.institution_service.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, Long> {
    // Consultar instituciones cercanas a unas coordenadas dentro de un radio
    @Query("SELECT i FROM Institution i WHERE " +
            "(6371 * acos(cos(radians(:lat)) * " +
            "cos(radians(i.location.latitude)) * " +
            "cos(radians(i.location.longitude) - " +
            "radians(:lng)) + sin(radians(:lat)) * sin(radians(i.location.latitude)))) <= :radius")
    List<Institution> findNearbyInstitutions(double lat, double lng, double radius);
}

