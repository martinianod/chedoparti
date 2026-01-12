package com.chedoparti.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiGatewayApplication {

	/**
	 * The main method of the application.
	 * This method is the entry point of the application and is responsible for starting the Spring Boot application.
	 * It takes an array of strings as arguments, which are the command line arguments passed to the application.
	 *
	 * @param args the command line arguments passed to the application
	 */
	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

}
