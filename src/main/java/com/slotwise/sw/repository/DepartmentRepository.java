package com.slotwise.sw.repository;

import com.slotwise.sw.entity.Department;
import com.slotwise.sw.entity.Institute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    List<Department> findByInstitute(Institute institute);
    List<Department> findByInstituteId(Long instituteId);
    boolean existsByName(String name);
}
