package com.slotwise.sw.repository;

import com.slotwise.sw.entity.User;
import com.slotwise.sw.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByDepartmentId(Long departmentId);
    List<User> findByRole(UserRole role);
    List<User> findByActive(Boolean active);
    boolean existsByEmail(String email);

    /**
     * Count users created in date range
     */
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    /**
     * New users per month
     */
    @Query(value = "SELECT YEAR(created_at) as yr, MONTH(created_at) as mo, COUNT(*) as cnt " +
           "FROM users WHERE created_at BETWEEN :from AND :to " +
           "GROUP BY YEAR(created_at), MONTH(created_at) " +
           "ORDER BY yr, mo", nativeQuery = true)
    List<Object[]> countNewUsersPerMonth(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
