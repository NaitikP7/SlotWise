package com.slotwise.sw.controller;

import com.slotwise.sw.entity.Institute;
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
    public ResponseEntity<List<Institute>> getAllInstitutes() {
        List<Institute> institutes = instituteService.getAllInstitutes();
        return new ResponseEntity<>(institutes, HttpStatus.OK);
    }

    /**
     * Get institute by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Institute> getInstituteById(@PathVariable Long id) {
        Optional<Institute> institute = instituteService.getInstituteById(id);
        return institute.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Get institute by name
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<Institute> getInstituteByName(@PathVariable String name) {
        Optional<Institute> institute = instituteService.getInstituteByName(name);
        return institute.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * Create new institute
     */
    @PostMapping
    public ResponseEntity<Institute> createInstitute(@RequestBody Institute institute) {
        try {
            Institute createdInstitute = instituteService.createInstitute(institute);
            return new ResponseEntity<>(createdInstitute, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Update institute
     */
    @PutMapping("/{id}")
    public ResponseEntity<Institute> updateInstitute(@PathVariable Long id, @RequestBody Institute instituteDetails) {
        try {
            Institute updatedInstitute = instituteService.updateInstitute(id, instituteDetails);
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


