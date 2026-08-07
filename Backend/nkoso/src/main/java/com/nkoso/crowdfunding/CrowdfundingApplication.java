package com.nkoso.crowdfunding;

import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class CrowdfundingApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrowdfundingApplication.class, args);
    }
    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

}