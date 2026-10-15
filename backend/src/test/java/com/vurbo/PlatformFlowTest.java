package com.vurbo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class PlatformFlowTest {

	@Autowired
	private MockMvc mvc;

	@Test
	void rejectsUnknownCredentials() throws Exception {
		mvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"username\":\"admin\",\"password\":\"errada123\"}"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.message").value("Utilizador ou palavra-passe incorretos."));
	}

	@Test
	void companyPublishesRepairAndTechniciansCompeteInArrivalOrder() throws Exception {
		String admin = login("admin", "admin123");

		mvc.perform(get("/api/technicians").header("Authorization", "Bearer " + admin))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(0));

		String anaId = createTechnician(admin, "Ana Sousa", "ana", "tecnico123");
		String brunoId = createTechnician(admin, "Bruno Lima", "bruno", "tecnico123");

		mvc.perform(post("/api/technicians")
						.header("Authorization", "Bearer " + admin)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"name":"Ana Sousa","username":"ana","password":"tecnico123"}
								"""))
				.andExpect(status().isConflict());

		String repairId = idOf(mvc.perform(post("/api/repairs")
						.header("Authorization", "Bearer " + admin)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"brand":"Bosch","applianceType":"Máquina de lavar","model":"WAN24263ES","locality":"Lisboa","description":"Não centrifuga."}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("ABERTA"))
				.andExpect(jsonPath("$.applicationCount").value(0))
				.andReturn());

		String ana = login("ana", "tecnico123");
		String bruno = login("bruno", "tecnico123");

		mvc.perform(post("/api/repairs").header("Authorization", "Bearer " + ana)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"brand":"Zanussi","applianceType":"Forno","locality":"Porto","description":"Não aquece."}
								"""))
				.andExpect(status().isForbidden());

		mvc.perform(get("/api/repairs/" + repairId + "/applications").header("Authorization", "Bearer " + ana))
				.andExpect(status().isForbidden());

		mvc.perform(post("/api/repairs/" + repairId + "/applications").header("Authorization", "Bearer " + ana))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.technicianUsername").value("ana"))
				.andExpect(jsonPath("$.position").value(1));

		Thread.sleep(30);

		mvc.perform(post("/api/repairs/" + repairId + "/applications").header("Authorization", "Bearer " + bruno))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.position").value(2));

		mvc.perform(post("/api/repairs/" + repairId + "/applications").header("Authorization", "Bearer " + ana))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("Já se candidatou a esta reparação."));

		mvc.perform(get("/api/repairs/" + repairId + "/applications").header("Authorization", "Bearer " + admin))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].technicianUsername").value("ana"))
				.andExpect(jsonPath("$[0].position").value(1))
				.andExpect(jsonPath("$[1].technicianUsername").value("bruno"))
				.andExpect(jsonPath("$[1].position").value(2));

		mvc.perform(get("/api/repairs/applications/mine").header("Authorization", "Bearer " + bruno))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].position").value(2))
				.andExpect(jsonPath("$[0].repair.brand").value("Bosch"))
				.andExpect(jsonPath("$[0].repair.locality").value("Lisboa"));

		mvc.perform(get("/api/repairs").header("Authorization", "Bearer " + ana))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[?(@.id == '" + repairId + "')].applied").value(true));

		mvc.perform(patch("/api/repairs/" + repairId)
						.header("Authorization", "Bearer " + admin)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"status\":\"FECHADA\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("FECHADA"));

		mvc.perform(get("/api/repairs").header("Authorization", "Bearer " + ana))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[?(@.id == '" + repairId + "')]").isEmpty());

		mvc.perform(post("/api/repairs/" + repairId + "/applications").header("Authorization", "Bearer " + bruno))
				.andExpect(status().isConflict());

		mvc.perform(patch("/api/technicians/" + anaId)
						.header("Authorization", "Bearer " + admin)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"active\":false}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.active").value(false));

		mvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"username\":\"ana\",\"password\":\"tecnico123\"}"))
				.andExpect(status().isUnauthorized());

		mvc.perform(patch("/api/technicians/" + brunoId)
						.header("Authorization", "Bearer " + admin)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"password\":\"nova12345\"}"))
				.andExpect(status().isOk());

		login("bruno", "nova12345");

		mvc.perform(patch("/api/auth/password")
						.header("Authorization", "Bearer " + admin)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"currentPassword\":\"admin123\",\"newPassword\":\"curta\"}"))
				.andExpect(status().isBadRequest());
	}

	private String createTechnician(String adminToken, String name, String username, String password) throws Exception {
		MvcResult result = mvc.perform(post("/api/technicians")
						.header("Authorization", "Bearer " + adminToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"name\":\"" + name + "\",\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.username").value(username))
				.andReturn();
		return idOf(result);
	}

	private String login(String username, String password) throws Exception {
		MvcResult result = mvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.role").exists())
				.andReturn();
		String body = result.getResponse().getContentAsString();
		return textField(body, "token");
	}

	private String idOf(MvcResult result) throws Exception {
		return textField(result.getResponse().getContentAsString(), "id");
	}

	private String textField(String json, String field) {
		String marker = "\"" + field + "\":\"";
		int start = json.indexOf(marker);
		if (start < 0) {
			throw new IllegalStateException("Campo em falta: " + field + " em " + json);
		}
		start += marker.length();
		int end = json.indexOf('"', start);
		return json.substring(start, end);
	}
}
