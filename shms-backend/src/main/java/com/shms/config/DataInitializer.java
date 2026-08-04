package com.shms.config;

import com.shms.model.User;
import com.shms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private SuperAdminProperties superAdminProperties;

    @Override
    public void run(String... args) throws Exception {

        // Create SUPER_ADMIN if not exists
        if (!userRepository
                .existsByEmail(superAdminProperties.getEmail())) {

//            User superAdmin = User.builder()
//                    .name("Super Admin")
//                    .email("superadmin@shms.com")
//                    .phone("9999999999")
//                    .passwordHash(passwordEncoder
//                        .encode("SuperAdmin@123"))
//                    .role(User.Role.SUPER_ADMIN)
//                    .isActive(true)
//                    .isVerified(true)
//                    .languagePref("EN")
//                    .build();
//
//            userRepository.save(superAdmin);

        	User superAdmin = User.builder()
        	        .name(superAdminProperties.getName())
        	        .email(superAdminProperties.getEmail())
        	        .phone(superAdminProperties.getPhone())
        	        .passwordHash(
        	            passwordEncoder.encode(
        	                superAdminProperties.getPassword()
        	            )
        	        )
        	        .role(User.Role.SUPER_ADMIN)
        	        .isActive(true)
        	        .isVerified(true)
        	        .languagePref(superAdminProperties.getLanguage())
        	        .build();
        	
        	
            System.out.println(
                "====================================");
            System.out.println(
                "SUPER_ADMIN created: "
                + "superadmin@shms.com");
            System.out.println(
                "Password: SuperAdmin@123");
            System.out.println(
                "Change this password immediately "
                + "in production.");
            System.out.println(
                "====================================");
        }
    }
}