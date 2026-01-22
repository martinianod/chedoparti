package com.chedoparti.institution_service.controller;

import com.chedoparti.institution_service.dto.TournamentDTO;
import com.chedoparti.institution_service.entity.Tournament;
import com.chedoparti.institution_service.repository.TournamentRepository;
import com.chedoparti.institution_service.repository.InstitutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    @Autowired
    private TournamentRepository tournamentRepository;
    
    @Autowired
    private InstitutionRepository institutionRepository;

    @GetMapping
    public ResponseEntity<List<TournamentDTO>> list(
            @RequestParam(required = false) Long institutionId,
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String status) {
        
        List<Tournament> tournaments;
        if (institutionId != null) {
            tournaments = tournamentRepository.findByInstitutionId(institutionId);
        } else if (sport != null) {
            tournaments = tournamentRepository.findBySport(sport);
        } else if (status != null) {
            tournaments = tournamentRepository.findByStatus(status);
        } else {
            tournaments = tournamentRepository.findAll();
        }
        
        return ResponseEntity.ok(tournaments.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TournamentDTO> get(@PathVariable Long id) {
        return tournamentRepository.findById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TournamentDTO> create(@RequestBody TournamentDTO dto) {
        Tournament tournament = new Tournament();
        tournament.setName(dto.getName());
        tournament.setSport(dto.getSport());
        tournament.setCategory(dto.getCategory());
        tournament.setGender(dto.getGender());
        tournament.setAgeRange(dto.getAgeRange());
        tournament.setDate(dto.getDate());
        tournament.setInscription(dto.getInscription());
        tournament.setStatus(dto.getStatus());
        tournament.setParticipants(dto.getParticipants());
        
        if (dto.getInstitutionId() != null) {
            institutionRepository.findById(dto.getInstitutionId())
                .ifPresent(tournament::setInstitution);
        }
        
        return ResponseEntity.ok(toDTO(tournamentRepository.save(tournament)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TournamentDTO> update(@PathVariable Long id, @RequestBody TournamentDTO dto) {
        return tournamentRepository.findById(id)
            .map(tournament -> {
                if (dto.getName() != null) tournament.setName(dto.getName());
                if (dto.getSport() != null) tournament.setSport(dto.getSport());
                if (dto.getCategory() != null) tournament.setCategory(dto.getCategory());
                if (dto.getGender() != null) tournament.setGender(dto.getGender());
                if (dto.getAgeRange() != null) tournament.setAgeRange(dto.getAgeRange());
                if (dto.getDate() != null) tournament.setDate(dto.getDate());
                if (dto.getInscription() != null) tournament.setInscription(dto.getInscription());
                if (dto.getStatus() != null) tournament.setStatus(dto.getStatus());
                if (dto.getParticipants() != null) tournament.setParticipants(dto.getParticipants());
                return toDTO(tournamentRepository.save(tournament));
            })
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tournamentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private TournamentDTO toDTO(Tournament tournament) {
        TournamentDTO dto = new TournamentDTO();
        dto.setId(tournament.getId());
        dto.setName(tournament.getName());
        dto.setSport(tournament.getSport());
        dto.setCategory(tournament.getCategory());
        dto.setGender(tournament.getGender());
        dto.setAgeRange(tournament.getAgeRange());
        dto.setDate(tournament.getDate());
        dto.setInscription(tournament.getInscription());
        dto.setStatus(tournament.getStatus());
        dto.setParticipants(tournament.getParticipants());
        if (tournament.getInstitution() != null) {
            dto.setInstitutionId(tournament.getInstitution().getId());
        }
        return dto;
    }
}
