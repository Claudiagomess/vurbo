package com.vurbo.auth;

import com.vurbo.user.UserAccount;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

	private final JwtEncoder encoder;
	private final long ttlHours;

	public JwtService(
			@Value("${vurbo.jwt.secret:vurbo-dev-secret-change-me-please-32}") String secret,
			@Value("${vurbo.jwt.ttl-hours:12}") long ttlHours) {
		SecretKey key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
		this.encoder = NimbusJwtEncoder.withSecretKey(key).build();
		this.ttlHours = ttlHours;
	}

	public String issue(UserAccount user) {
		Instant now = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer("vurbo")
				.subject(user.getUsername())
				.issuedAt(now)
				.expiresAt(now.plus(ttlHours, ChronoUnit.HOURS))
				.claim("role", user.getRole().name())
				.claim("uid", user.getId().toString())
				.claim("name", user.getName())
				.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}
}
