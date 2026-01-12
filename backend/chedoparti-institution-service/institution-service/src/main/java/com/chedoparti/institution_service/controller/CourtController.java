package com.chedoparti.institution_service.controller;

import com.chedoparti.institution_service.dto.CourtDTO;
import com.chedoparti.institution_service.service.CourtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/institutions/{institutionId}/courts")
public class CourtController {

    @Autowired
    CourtService courtService;

    public CourtController(CourtService courtService) {
        this.courtService = courtService;
    }


    /**
     * Retrieves all courts associated with a given institution.
     *
     * @param institutionId The id of the institution.
     * @return A ResponseEntity containing a list of CourtDTOs and a status of 200 (OK).
     */
    @GetMapping
    public ResponseEntity<List<CourtDTO>> getAllCourtsByInstitution(@PathVariable Long institutionId) {
        List<CourtDTO> courts = courtService.getAllCourtsByInstitution(institutionId);
        return new ResponseEntity<>(courts, HttpStatus.OK);
    }


    /**
     * Gets a court by id.
     *
     * @param institutionId The id of the institution.
     * @param courtId The id of the court.
     * @return A ResponseEntity with the court and a status of 200 (OK).
     */
    @GetMapping("/{courtId}")
    public ResponseEntity<CourtDTO> getCourtById(@PathVariable Long institutionId, @PathVariable Long courtId) {
        CourtDTO court = courtService.getCourtById(institutionId, courtId);
        return new ResponseEntity<>(court, HttpStatus.OK);
    }

    /**
     * Create a new court for a given institution
     *
     * @param institutionId The id of the institution
     * @param courtDTO The details of the court to create
     * @return A ResponseEntity with the newly created court and a status of 201 (CREATED)
     */
    @PostMapping
    public ResponseEntity<CourtDTO> createCourt(@PathVariable Long institutionId, @RequestBody CourtDTO courtDTO) {
        CourtDTO newCourt = courtService.createCourt(institutionId, courtDTO);
        return new ResponseEntity<>(newCourt, HttpStatus.CREATED);
    }

    /**
     * Actualiza una cancha específica de una institución
     *
     * @param institutionId El id de la institución
     * @param courtId El id de la cancha a actualizar
     * @param courtDetails Los detalles de la cancha a actualizar
     * @return Un ResponseEntity con un status de 200 (OK) si se actualiza correctamente
     */
    @PutMapping("/{courtId}")
    public ResponseEntity<CourtDTO> updateCourt(
            @PathVariable Long institutionId,
            @PathVariable Long courtId,
            @RequestBody CourtDTO courtDetails) {
        CourtDTO updatedCourt = courtService.updateCourt(institutionId, courtId, courtDetails);
        return new ResponseEntity<>(updatedCourt, HttpStatus.OK);
    }


    /**
     * Elimina una cancha específica de una institución
     *
     * @param institutionId El id de la institución
     * @param courtId El id de la cancha a eliminar
     * @return Un ResponseEntity con un status de 204 (No Content) si se eliminó correctamente
     */
    @DeleteMapping("/{courtId}")
    public ResponseEntity<Void> deleteCourt(@PathVariable Long institutionId, @PathVariable Long courtId) {
        courtService.deleteCourt(institutionId, courtId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

