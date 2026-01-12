package com.chedoparti.institution_service.controller;

import com.chedoparti.institution_service.dto.InstitutionDTO;
import com.chedoparti.institution_service.service.InstitutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
public class InstitutionController {

    private final InstitutionService institutionService;

    public InstitutionController(InstitutionService institutionService) {
        this.institutionService = institutionService;
    }

    /**
     * Create a new institution based on the given InstitutionDTO.
     *
     * @param institutionDto The InstitutionDTO containing the data of the new institution.
     * @return A ResponseEntity containing the InstitutionDTO of the created institution.
     */
    @PostMapping
    public ResponseEntity<InstitutionDTO> createInstitution(@RequestBody InstitutionDTO institutionDto) {
        return ResponseEntity.ok(institutionService.createInstitution(institutionDto));
    }

    /**
     * Updates an institution with the given institutionId.
     *
     * @param institutionId The id of the institution to be updated.
     * @param institutionDTO The details of the institution to be updated.
     * @return ResponseEntity containing the updated institution.
     */
    @PutMapping("/{id}")
    public ResponseEntity<InstitutionDTO> updateInstitution(@PathVariable Long institutionId, @RequestBody InstitutionDTO institutionDTO) {
        return ResponseEntity.ok(institutionService.updateInstitution(institutionId, institutionDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstitution(@PathVariable Long institutionId) {
        institutionService.deleteInstitution(institutionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{institutionId}")
    public ResponseEntity<InstitutionDTO> getInstitutionById(@PathVariable Long institutionId) {
        return ResponseEntity.ok(institutionService.getInstitutionById(institutionId));
    }

    /**
     * Retrieve all institutions.
     *
     * @return ResponseEntity containing a list of InstitutionDTO.
     */
    @GetMapping
    public ResponseEntity<List<InstitutionDTO>> getAllInstitutions() {
        return ResponseEntity.ok(institutionService.getAllInstitutions());
    }
}

