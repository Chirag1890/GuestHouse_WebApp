package com.Application.GuestHouseBooking.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;

@Getter
@Configuration
public class JwtConfig {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds (default)
    private Long expiration;

    @Value("${jwt.header:Authorization}")
    private String header;

    @Value("${jwt.prefix:Bearer}")
    private String prefix;

    @Value("${jwt.clock-skew:300000}") // 5 minutes in milliseconds (default)
    private Long clockSkew;

    // Refresh token settings
    @Value("${jwt.refresh.expiration:604800000}") // 7 days in milliseconds (default)
    private Long refreshExpiration;
}