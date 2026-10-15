package com.vurbo.config;

import com.vurbo.user.UserAccount;
import com.vurbo.user.UserAccountRepository;
import com.vurbo.user.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

	private final UserAccountRepository users;
	private final PasswordEncoder passwordEncoder;
	private final String username;
	private final String password;
	private final String name;

	public AdminSeeder(
			UserAccountRepository users,
			PasswordEncoder passwordEncoder,
			@Value("${vurbo.admin.username}") String username,
			@Value("${vurbo.admin.password}") String password,
			@Value("${vurbo.admin.name}") String name) {
		this.users = users;
		this.passwordEncoder = passwordEncoder;
		this.username = username.trim().toLowerCase();
		this.password = password;
		this.name = name;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (users.existsByUsername(username)) {
			return;
		}
		UserAccount admin = new UserAccount();
		admin.setUsername(username);
		admin.setPasswordHash(passwordEncoder.encode(password));
		admin.setName(name);
		admin.setRole(UserRole.EMPRESA);
		admin.setActive(true);
		users.save(admin);
		log.info("Conta inicial da empresa criada para o utilizador {}", username);
	}
}
