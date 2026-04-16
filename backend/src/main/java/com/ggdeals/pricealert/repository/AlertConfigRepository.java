package com.ggdeals.pricealert.repository;

import com.ggdeals.pricealert.model.AlertConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AlertConfigRepository extends JpaRepository<AlertConfig, Long> {
    Optional<AlertConfig> findByUserId(String userId);
}
