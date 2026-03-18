package com.slotwise.sw.service;

import com.slotwise.sw.entity.Department;
import com.slotwise.sw.entity.Institute;
import com.slotwise.sw.repository.DepartmentRepository;
import com.slotwise.sw.repository.InstituteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private InstituteRepository instituteRepository;

    /**
     * Get all departments
     */
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    /**
     * Get department by ID
     */
    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    /**
     * Get department by name
     */
    public Optional<Department> getDepartmentByName(String name) {
        return departmentRepository.findByName(name);
    }

    /**
     * Get all departments by institute
     */
    public List<Department> getDepartmentsByInstitute(Long instituteId) {
        return departmentRepository.findByInstituteId(instituteId);
    }

    /**
     * Create new department
     */
    public Department createDepartment(Department department) {
        if (departmentRepository.existsByName(department.getName())) {
            throw new IllegalArgumentException("Department with name '" + department.getName() + "' already exists");
        }

        if (department.getInstitute() != null && department.getInstitute().getId() != null) {
            Institute institute = instituteRepository.findById(department.getInstitute().getId())
                    .orElseThrow(() -> new RuntimeException("Institute not found with ID: " + department.getInstitute().getId()));
            department.setInstitute(institute);
        } else {
            throw new IllegalArgumentException("Institute is required for department creation");
        }

        return departmentRepository.save(department);
    }

    /**
     * Update department
     */
    public Department updateDepartment(Long id, Department departmentDetails) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + id));

        if (!department.getName().equals(departmentDetails.getName()) &&
                departmentRepository.existsByName(departmentDetails.getName())) {
            throw new IllegalArgumentException("Department with name '" + departmentDetails.getName() + "' already exists");
        }

        department.setName(departmentDetails.getName());

        if (departmentDetails.getInstitute() != null && departmentDetails.getInstitute().getId() != null) {
            Institute institute = instituteRepository.findById(departmentDetails.getInstitute().getId())
                    .orElseThrow(() -> new RuntimeException("Institute not found with ID: " + departmentDetails.getInstitute().getId()));
            department.setInstitute(institute);
        }

        return departmentRepository.save(department);
    }

    /**
     * Delete department
     */
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found with ID: " + id);
        }
        departmentRepository.deleteById(id);
    }

    /**
     * Check if department exists by name
     */
    public boolean existsByName(String name) {
        return departmentRepository.existsByName(name);
    }
}

