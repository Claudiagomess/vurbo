package com.vurbo.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class TechnicianRequests {

	private TechnicianRequests() {
	}

	public record Create(
			@NotBlank(message = "O nome é obrigatório.") @Size(max = 160) String name,
			@NotBlank(message = "O utilizador é obrigatório.")
			@Size(min = 3, max = 80, message = "O utilizador tem de ter entre 3 e 80 caracteres.")
			@Pattern(regexp = "^[A-Za-z0-9._-]+$", message = "O utilizador só pode ter letras, números, ponto, _ ou -.")
			String username,
			@NotBlank(message = "A palavra-passe é obrigatória.")
			@Size(min = 8, max = 80, message = "A palavra-passe tem de ter pelo menos 8 caracteres.")
			String password) {
	}

	public record Update(
			@Size(max = 160) String name,
			Boolean active,
			@Size(min = 8, max = 80, message = "A palavra-passe tem de ter pelo menos 8 caracteres.") String password) {
	}
}
