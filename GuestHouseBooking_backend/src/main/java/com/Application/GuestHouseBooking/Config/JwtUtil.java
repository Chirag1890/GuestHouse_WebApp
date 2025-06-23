package com.Application.GuestHouseBooking.Config;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Autowired
    private JwtConfig jwtConfig;

    private Key key;
    private final Map<String, Date> tokenBlacklist = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtConfig.getSecret());
            this.key = Keys.hmacShaKeyFor(keyBytes);
            logger.info("JWT key initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize JWT key: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize JWT key", e);
        }
    }

    // Clean up expired tokens from blacklist every hour
    @Scheduled(fixedRate = 3600000)
    public void cleanupBlacklist() {
        Date now = new Date();
        tokenBlacklist.entrySet().removeIf(entry -> entry.getValue().before(now));
        logger.debug("Cleaned up token blacklist");
    }

    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (ExpiredJwtException e) {
            logger.warn("Token expired while extracting username");
            throw e;
        } catch (Exception e) {
            logger.error("Error extracting username from token: {}", e.getMessage());
            throw e;
        }
    }

    public Date extractExpiration(String token) {
        try {
            return extractClaim(token, Claims::getExpiration);
        } catch (ExpiredJwtException e) {
            logger.warn("Token expired while extracting expiration");
            throw e;
        } catch (Exception e) {
            logger.error("Error extracting expiration from token: {}", e.getMessage());
            throw e;
        }
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .setAllowedClockSkewSeconds(jwtConfig.getClockSkew() / 1000)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            logger.warn("Token has expired");
            throw e;
        } catch (MalformedJwtException e) {
            logger.error("Malformed token");
            throw e;
        } catch (SignatureException e) {
            logger.error("Invalid token signature");
            throw e;
        } catch (Exception e) {
            logger.error("Error parsing token: {}", e.getMessage());
            throw e;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Boolean isTokenExpired(String token) {
        try {
            final Date expiration = extractExpiration(token);
            boolean isExpired = expiration.before(new Date(System.currentTimeMillis() - jwtConfig.getClockSkew()));
            if (isExpired) {
                logger.debug("Token has expired. Expiration: {}", expiration);
            }
            return isExpired;
        } catch (ExpiredJwtException e) {
            logger.warn("Token already expired");
            return true;
        } catch (Exception e) {
            logger.error("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }

    public String generateToken(UserDetails userDetails) {
        try {
            Map<String, Object> claims = new HashMap<>();
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("ROLE_USER");
            claims.put("role", role.startsWith("ROLE_") ? role.substring(5) : role);
            
            String token = createToken(claims, userDetails.getUsername());
            logger.debug("Generated token for user: {}", userDetails.getUsername());
            return token;
        } catch (Exception e) {
            logger.error("Error generating token for user {}: {}", userDetails.getUsername(), e.getMessage());
            throw new RuntimeException("Error generating token", e);
        }
    }

    private String createToken(Map<String, Object> claims, String subject) {
        try {
            long currentTimeMillis = System.currentTimeMillis();
            Date issuedAt = new Date(currentTimeMillis);
            Date expirationDate = new Date(currentTimeMillis + jwtConfig.getExpiration());
            
            String token = Jwts.builder()
                    .setClaims(claims)
                    .setSubject(subject)
                    .setIssuedAt(issuedAt)
                    .setExpiration(expirationDate)
                    .signWith(key, SignatureAlgorithm.HS256)
                    .compact();
            
            logger.debug("Created token for subject: {}. Expires at: {}", subject, expirationDate);
            return token;
        } catch (Exception e) {
            logger.error("Error creating token for subject {}: {}", subject, e.getMessage());
            throw new RuntimeException("Error creating token", e);
        }
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            if (isTokenBlacklisted(token)) {
                logger.warn("Token is blacklisted");
                return false;
            }
            
            final String username = extractUsername(token);
            boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
            
            if (!isValid) {
                logger.warn("Token validation failed for user: {}", userDetails.getUsername());
            }
            
            return isValid;
        } catch (ExpiredJwtException e) {
            logger.warn("Token expired during validation");
            return false;
        } catch (Exception e) {
            logger.error("Error validating token: {}", e.getMessage());
            return false;
        }
    }

    public void invalidateToken(String token) {
        try {
            Date expiry = extractExpiration(token);
            tokenBlacklist.put(token, expiry);
            logger.debug("Token blacklisted until: {}", expiry);
        } catch (ExpiredJwtException e) {
            // If token is already expired, no need to blacklist
            logger.debug("Attempted to blacklist already expired token");
        } catch (Exception e) {
            logger.error("Error invalidating token: {}", e.getMessage());
        }
    }

    public boolean isTokenBlacklisted(String token) {
        Date blacklistedUntil = tokenBlacklist.get(token);
        if (blacklistedUntil != null) {
            if (blacklistedUntil.before(new Date())) {
                tokenBlacklist.remove(token);
                return false;
            }
            return true;
        }
        return false;
    }
} 