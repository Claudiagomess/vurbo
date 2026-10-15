package com.vurbo.config;

import com.vurbo.user.UserAccountRepository;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	JwtDecoder jwtDecoder(@Value("${vurbo.jwt.secret:vurbo-dev-secret-change-me-please-32}") String secret) {
		SecretKey key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
		return NimbusJwtDecoder.withSecretKey(key).build();
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, UserAccountRepository users) throws Exception {
		http
				.csrf(AbstractHttpConfigurer::disable)
				.cors(Customizer.withDefaults())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
						.requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
						.requestMatchers("/api/technicians/**").hasRole("EMPRESA")
						.requestMatchers(HttpMethod.POST, "/api/repairs").hasRole("EMPRESA")
						.requestMatchers(HttpMethod.PATCH, "/api/repairs/**").hasRole("EMPRESA")
						.requestMatchers(HttpMethod.GET, "/api/repairs/*/applications").hasRole("EMPRESA")
						.requestMatchers(HttpMethod.POST, "/api/repairs/*/applications").hasRole("TECNICO")
						.requestMatchers("/api/**").authenticated()
						.anyRequest().denyAll())
				.oauth2ResourceServer(oauth -> oauth.jwt(jwt -> jwt.jwtAuthenticationConverter(token -> {
					var account = users.findByUsername(token.getSubject()).filter(user -> user.isActive()).orElse(null);
					var authorities = account == null
							? List.<SimpleGrantedAuthority>of()
							: List.of(new SimpleGrantedAuthority("ROLE_" + account.getRole().name()));
					return new JwtAuthenticationToken(token, authorities, token.getSubject());
				})))
				.exceptionHandling(errors -> errors
						.authenticationEntryPoint((request, response, exception) -> {
							response.setStatus(401);
							response.setContentType("application/json");
							response.getWriter().write("{\"message\":\"É necessário iniciar sessão.\"}");
						})
						.accessDeniedHandler((request, response, exception) -> {
							response.setStatus(403);
							response.setContentType("application/json");
							response.getWriter().write("{\"message\":\"Não tem permissão para esta ação.\"}");
						}));
		return http.build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(@Value("${vurbo.cors-origins}") String origins) {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).filter(value -> !value.isEmpty()).toList());
		configuration.setAllowedMethods(List.of("GET", "POST", "PATCH", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
