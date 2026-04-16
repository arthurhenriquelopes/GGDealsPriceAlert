package com.ggdeals.pricealert.controller;

import com.ggdeals.pricealert.model.AlertConfig;
import com.ggdeals.pricealert.repository.AlertConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(origins = "*") // Para facilitar o desenvolvimento local com o React
public class AlertConfigController {

    @Autowired
    private AlertConfigRepository repository;

    @GetMapping
    public List<AlertConfig> getAllConfigs() {
        return repository.findAll();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<AlertConfig> getConfig(@PathVariable String userId) {
        return repository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public AlertConfig saveConfig(@RequestBody AlertConfig config) {
        // Se já existe uma config para este usuário, faz o update
        Optional<AlertConfig> existing = repository.findByUserId(config.getUserId());
        if (existing.isPresent()) {
            config.setId(existing.get().getId());
        }
        return repository.save(config);
    }
}
