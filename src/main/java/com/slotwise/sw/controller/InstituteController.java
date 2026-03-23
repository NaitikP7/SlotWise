package com.slotwise.sw.controller;

import com.slotwise.sw.dto.InstituteRequestDTO;
import com.slotwise.sw.dto.InstituteResponseDTO;
import com.slotwise.sw.service.InstituteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/institutes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InstituteController {

    @Autowired
    private InstituteService instituteService;

    /**
     * Get all institutes
     */
    @GetMapping
    public ResponseEntity<List<InstituteResponseDTO>> getAllInstitutes() {
        List<InstituteResponseDTO> institutes = instituteService.getAllInstitutes();
        return new ResponseEntity<>(institutes, HttpStatus.OK);
    }

    /**
     * Get institute by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<InstituteResponseDTO> getInstituteById(@PathVariable Long id) {
        Optional<InstituteResponseDTO> institute = instituteService.getInstituteById(id);
        return institute.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Get institute by name
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<InstituteResponseDTO> getInstituteByName(@PathVariable String name) {
        Optional<InstituteResponseDTO> institute = instituteService.getInstituteByName(name);
        return institute.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Create new institute
     */
    @PostMapping
    public ResponseEntity<InstituteResponseDTO> createInstitute(@RequestBody InstituteRequestDTO requestDTO) {
        try {
            InstituteResponseDTO createdInstitute = instituteService.createInstitute(requestDTO);
            return new ResponseEntity<>(createdInstitute, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Update institute
     */
    @PutMapping("/{id}")
    public ResponseEntity<InstituteResponseDTO> updateInstitute(@PathVariable Long id, @RequestBody InstituteRequestDTO requestDTO) {
        try {
            InstituteResponseDTO updatedInstitute = instituteService.updateInstitute(id, requestDTO);
            return new ResponseEntity<>(updatedInstitute, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Delete institute
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstitute(@PathVariable Long id) {
        try {
            instituteService.deleteInstitute(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Check if institute exists by name
     */
    @GetMapping("/exists/{name}")
    public ResponseEntity<Boolean> existsByName(@PathVariable String name) {
        boolean exists = instituteService.existsByName(name);
        return new ResponseEntity<>(exists, HttpStatus.OK);
    }
}


