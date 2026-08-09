package com.nkoso.crowdfunding.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI nkosoOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Nkoso Crowdfunding API")
                        .description("REST API for the Nkoso crowdfunding platform — campaigns, donations, and user management")
                        .version("1.0.0"));
    }

}