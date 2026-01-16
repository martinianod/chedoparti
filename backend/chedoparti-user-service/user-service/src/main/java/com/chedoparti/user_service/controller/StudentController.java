package com.chedoparti.user_service.controller;

import com.chedoparti.user_service.dto.StudentDTO;
import com.chedoparti.user_service.entity.Student;
import com.chedoparti.user_service.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<List<StudentDTO>> list(
            @RequestParam Long coachId,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) Boolean isMember,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) String search) {
        
        List<Student> students;
        if (level != null) {
            students = studentRepository.findByCoachIdAndLevel(coachId, level);
        } else if (sport != null) {
            students = studentRepository.findByCoachIdAndSport(coachId, sport);
        } else {
            students = studentRepository.findByCoachId(coachId);
        }
        
        // Apply additional filters
        if (isMember != null) {
            students = students.stream()
                .filter(s -> isMember.equals(s.getIsMember()))
                .collect(Collectors.toList());
        }
        
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            students = students.stream()
                .filter(s -> s.getName().toLowerCase().contains(searchLower) || 
                           (s.getEmail() != null && s.getEmail().toLowerCase().contains(searchLower)))
                .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(students.stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> get(@PathVariable Long id) {
        return studentRepository.findById(id)
            .map(this::toDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StudentDTO> create(@RequestBody StudentDTO dto) {
        Student student = new Student();
        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setLevel(dto.getLevel());
        student.setSport(dto.getSport());
        student.setIsMember(dto.getIsMember());
        student.setCoachId(dto.getCoachId());
        student.setInstitutionId(dto.getInstitutionId());
        
        return ResponseEntity.ok(toDTO(studentRepository.save(student)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> update(@PathVariable Long id, @RequestBody StudentDTO dto) {
        return studentRepository.findById(id)
            .map(student -> {
                if (dto.getName() != null) student.setName(dto.getName());
                if (dto.getEmail() != null) student.setEmail(dto.getEmail());
                if (dto.getLevel() != null) student.setLevel(dto.getLevel());
                if (dto.getSport() != null) student.setSport(dto.getSport());
                if (dto.getIsMember() != null) student.setIsMember(dto.getIsMember());
                return toDTO(studentRepository.save(student));
            })
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(@PathVariable Long id) {
        studentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private StudentDTO toDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setLevel(student.getLevel());
        dto.setSport(student.getSport());
        dto.setIsMember(student.getIsMember());
        dto.setCoachId(student.getCoachId());
        dto.setInstitutionId(student.getInstitutionId());
        return dto;
    }
}
