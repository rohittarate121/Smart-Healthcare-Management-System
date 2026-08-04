package com.shms.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "superadmin")
public class SuperAdminProperties {

    private String name;
    private String email;
    private String phone;
    private String password;
    private String language;
}