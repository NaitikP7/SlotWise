package com.slotwise.sw.service;

import com.slotwise.sw.entity.Institute;
import com.slotwise.sw.repository.InstituteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class InstituteService {

    @Autowired
    private InstituteRepository instituteRepository;

    /**
     * Get all institutes
     */
    public List<Institute> getAllInstitutes() {
        return instituteRepository.findAll();
    }

    /**
     * Get institute by ID
     */
    public Optional<Institute> getInstituteById(Long id) {
        return instituteRepository.findById(id);
    }

    /**
     * Get institute by name
     */
    public Optional<Institute> getInstituteByName(String name) {
        return instituteRepository.findByName(name);
    }

    /**
     * Create new institute
     */
    public Institute createInstitute(Institute institute) {
        if (instituteRepository.existsByName(institute.getName())) {
            throw new IllegalArgumentException("Institute with name '" + institute.getName() + "' already exists");
        }
        return instituteRepository.save(institute);
    }

    /**
     * Update institute
     */
    public Institute updateInstitute(Long id, Institute instituteDetails) {
        Institute institute = instituteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institute not found with ID: " + id));

        if (!institute.getName().equals(instituteDetails.getName()) &&
                instituteRepository.existsByName(instituteDetails.getName())) {
            throw new IllegalArgumentException("Institute with name '" + instituteDetails.getName() + "' already exists");
        }

        institute.setName(instituteDetails.getName());
        return instituteRepository.save(institute);
    }

    /**
     * Delete institute
     */
    public void deleteInstitute(Long id) {
        if (!instituteRepository.existsById(id)) {
            throw new RuntimeException("Institute not found with ID: " + id);
        }
        instituteRepository.deleteById(id);
    }

    /**
     * Check if institute exists by name
     */
    public boolean existsByName(String name) {
        return instituteRepository.existsByName(name);
    }
}

