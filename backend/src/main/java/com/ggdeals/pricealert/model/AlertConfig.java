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
    private String userId; // Alterado para String para suportar "default-user" sem Supabase

    private String title = "";
    
    // Ratings
    private Integer minRating = 0;
    private Integer maxRating = 10;
    
    // Price & Discount
    private Double minPrice = 0.0;
    private Double maxPrice = 100.0;
    private Boolean onlyHistoricalLow = false;
    private Integer minDiscount = 0;
    private Integer maxDiscount = 100;

    // Time Constraints
    private String dealsDate = "";
    private String releaseDate = "";
    
    // Stores & Platforms & Delivery
    @Column(length = 500)
    private String drms = "";
    @Column(length = 500)
    private String stores = "";
    @Column(length = 500)
    private String platforms = "";
    @Column(length = 500)
    private String subscriptions = "";
    
    // Reviews
    private Integer minMetascore = 0;
    private Integer maxMetascore = 100;
    @Column(length = 50)
    private String steamReviews = ""; // E.g., "7,8,9" (Positive, Very Positive, Overwhelmingly Positive)

    // Game Length (HLTB)
    private Integer minHltbCompletionMain = 0;
    private Integer maxHltbCompletionMain = 200;

    private String preset = "";
    private String sort = "date";

    private String groqApiKey; // Legacy, kept for structure backward compat if needed, or remove. Actually let's remove it entirely.

    private String emailReceiver;
}
