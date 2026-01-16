package com.chedoparti.institution_service.controller;

import com.chedoparti.institution_service.dto.GroupDTO;
import com.chedoparti.institution_service.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @GetMapping
    public ResponseEntity<List<GroupDTO>> list(
            @RequestParam Long coachId,
            @RequestParam(required = false) Boolean includeArchived,
            @RequestParam(required = false) String sport) {
        return ResponseEntity.ok(groupService.findByCoach(coachId, includeArchived, sport));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.findById(id));
    }

    @PostMapping
    public ResponseEntity<GroupDTO> create(@RequestBody GroupDTO dto) {
        return ResponseEntity.ok(groupService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupDTO> update(@PathVariable Long id, @RequestBody GroupDTO dto) {
        return ResponseEntity.ok(groupService.update(id, dto));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<GroupDTO> archive(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.archive(id));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<GroupDTO> restore(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.restore(id));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<GroupDTO> duplicate(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.duplicate(id));
    }

    @PostMapping("/{groupId}/students")
    public ResponseEntity<GroupDTO> addStudent(
            @PathVariable Long groupId,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(groupService.addStudent(groupId, body.get("studentId")));
    }

    @DeleteMapping("/{groupId}/students/{studentId}")
    public ResponseEntity<GroupDTO> removeStudent(
            @PathVariable Long groupId,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(groupService.removeStudent(groupId, studentId));
    }

    @PutMapping("/{groupId}/students/reorder")
    public ResponseEntity<GroupDTO> reorderStudents(
            @PathVariable Long groupId,
            @RequestBody Map<String, List<Long>> body) {
        return ResponseEntity.ok(groupService.reorderStudents(groupId, body.get("studentIds")));
    }

    @GetMapping("/{groupId}/students")
    public ResponseEntity<List<Long>> getStudents(@PathVariable Long groupId) {
        GroupDTO group = groupService.findById(groupId);
        return ResponseEntity.ok(List.copyOf(group.getStudentIds()));
    }
}
