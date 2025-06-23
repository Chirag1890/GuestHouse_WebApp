package com.Application.GuestHouseBooking.Config;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private JwtConfig jwtConfig;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String requestPath = request.getServletPath();

        // Skip filter for authentication endpoints and terms-and-conditions
        if (requestPath.contains("/api/auth/") || 
            requestPath.contains("/terms-and-conditions")) {
            chain.doFilter(request, response);
            return;
        }

        try {
            String authHeader = request.getHeader(jwtConfig.getHeader());
            String username = null;
            String jwt = null;

            if (authHeader != null && authHeader.startsWith(jwtConfig.getPrefix() + " ")) {
                jwt = authHeader.substring(jwtConfig.getPrefix().length() + 1);
                username = jwtUtil.extractUsername(jwt);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    
                    if (jwtUtil.validateToken(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
            
            chain.doFilter(request, response);

        } catch (ExpiredJwtException e) {
            logger.error("JWT token has expired: {}", e.getMessage());
            handleError(response, HttpServletResponse.SC_UNAUTHORIZED, "Token has expired", e.getMessage());
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
            handleError(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token signature", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            handleError(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token format", e.getMessage());
        } catch (Exception e) {
            logger.error("Unable to process JWT token: {}", e.getMessage());
            handleError(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed", e.getMessage());
        }
    }

    private void handleError(HttpServletResponse response, int status, String error, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
} 