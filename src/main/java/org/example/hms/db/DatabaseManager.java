package org.example.hms.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseManager {
    // Connect to MySQL server first to create database
    private static final String BASE_URL = "jdbc:mysql://localhost:3306/";
    private static final String URL = BASE_URL + "hospital_db?allowPublicKeyRetrieval=true&useSSL=false";
    private static final String DB_NAME = "hospital_db";
    private static final String USER = "root";
    private static final String PASSWORD = "pass123";

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
    
    public static void initializeDatabase() {
        try (Connection conn = DriverManager.getConnection(BASE_URL + "?allowPublicKeyRetrieval=true&useSSL=false", USER, PASSWORD);
             Statement stmt = conn.createStatement()) {
            
            stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS " + DB_NAME);
            stmt.executeUpdate("USE " + DB_NAME);
            
            // Create Patients table
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS patients (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "name VARCHAR(100) NOT NULL," +
                    "age INT," +
                    "gender VARCHAR(10)," +
                    "contact VARCHAR(20)," +
                    "password VARCHAR(255) DEFAULT '123'," +
                    "registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ")");
                    
            // Create Doctors table
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS doctors (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "name VARCHAR(100) NOT NULL," +
                    "specialization VARCHAR(100)," +
                    "contact VARCHAR(20)," +
                    "email VARCHAR(100)," +
                    "password VARCHAR(255) DEFAULT 'admin123'" +
                    ")");

            try { stmt.executeUpdate("ALTER TABLE patients ADD COLUMN password VARCHAR(255) DEFAULT '123'"); } catch(Exception e) {}
            try { stmt.executeUpdate("ALTER TABLE doctors ADD COLUMN password VARCHAR(255) DEFAULT 'admin123'"); } catch(Exception e) {}
            try { stmt.executeUpdate("ALTER TABLE doctors ADD COLUMN email VARCHAR(100) DEFAULT 'doc@hospital.com'"); } catch(Exception e) {}

            // Create Appointments table
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS appointments (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "patient_id INT," +
                    "doctor_id INT," +
                    "problem VARCHAR(255)," +
                    "appointment_date DATETIME," +
                    "status VARCHAR(20) DEFAULT 'SCHEDULED'," +
                    "FOREIGN KEY (patient_id) REFERENCES patients(id)," +
                    "FOREIGN KEY (doctor_id) REFERENCES doctors(id)" +
                    ")");

            try { stmt.executeUpdate("ALTER TABLE appointments ADD COLUMN problem VARCHAR(255) DEFAULT 'Not Specified'"); } catch(Exception e) {}
                    
            // Create Billing table
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS billing (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY," +
                    "patient_id INT," +
                    "appointment_id INT," +
                    "amount DECIMAL(10, 2)," +
                    "date DATETIME DEFAULT CURRENT_TIMESTAMP," +
                    "status VARCHAR(20) DEFAULT 'UNPAID'," +
                    "FOREIGN KEY (patient_id) REFERENCES patients(id)" +
                    ")");
            
            try { stmt.executeUpdate("ALTER TABLE billing ADD COLUMN appointment_id INT DEFAULT 0"); } catch(Exception e) {}
                    
            System.out.println("Database and tables initialized successfully.");
        } catch (SQLException e) {
            System.err.println("Database initialization failed. Please ensure MySQL is running on port 3306 with password 'pass123'.");
            System.err.println("Error details: " + e.getMessage());
        }
    }
}
