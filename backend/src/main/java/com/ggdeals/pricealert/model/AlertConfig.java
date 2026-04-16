package com.ggdeals.pricealert.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Data
@Entity
@Table(name = "alert_configs")
public class AlertConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID userId; // Referência ao ID do usuário no Supabase Auth

    private String platformFamily = "pc";
    private Integer minRating = 5;
    private Double maxPrice = 20.0;
    private Boolean onlyHistoricalLow = false;
    
    @Column(length = 500)
    private String drms; // Lista de IDs salvos como String ou JSON
    
    @Column(length = 500)
    private String stores;

    private String emailReceiver;
}
