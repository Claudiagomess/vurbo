package com.vurbo.auth;

import com.vurbo.user.UserRole;
import java.util.UUID;

public record AuthResponse(String token, UUID id, String username, String name, UserRole role) {
}
