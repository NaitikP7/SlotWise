package com.slotwise.sw.repository;

import com.slotwise.sw.entity.User;
import com.slotwise.sw.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByDepartmentId(Long departmentId);
    List<User> findByRole(UserRole role);
    List<User> findByActive(Boolean active);
    boolean existsByEmail(String email);
}
