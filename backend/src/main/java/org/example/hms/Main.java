package org.example.hms;

import io.github.cdimascio.dotenv.Dotenv;
import io.javalin.Javalin;
import org.example.hms.db.DatabaseManager;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {

    private static final Dotenv dotenv = Dotenv.configure()
            .directory("./")
            .ignoreIfMissing()
            .load();

    public static void main(String[] args) {
        DatabaseManager.initializeDatabase();
        seedDoctors();
        seedMockData();

        int port = Integer.parseInt(dotenv.get("SERVER_PORT", "7000"));
        String corsOrigin = dotenv.get("CORS_ORIGIN", "http://localhost:5173");

        Javalin app = Javalin.create(config -> {
            config.bundledPlugins.enableCors(cors -> cors.addRule(it -> {
                it.allowHost(corsOrigin, "http://localhost:3000", "http://localhost:5173");
                it.allowCredentials = true;
            }));
        }).start(port);

        System.out.println("[HMS] Server running on http://localhost:" + port);
        System.out.println("[HMS] Accepting requests from: " + corsOrigin);

        // --- DASHBOARD ---
        app.get("/api/dashboard", ctx -> {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalPatients", getCount("patients"));
            stats.put("totalDoctors", getCount("doctors"));
            stats.put("totalAppointments", getCount("appointments"));
            ctx.json(stats);
        });

        // --- DOCTORS ---
        app.get("/api/doctors", ctx -> {
            List<Map<String, Object>> doctors = new ArrayList<>();
            try (Connection conn = DatabaseManager.getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM doctors")) {
                while (rs.next()) {
                    Map<String, Object> doc = new HashMap<>();
                    doc.put("id", rs.getInt("id"));
                    doc.put("name", rs.getString("name"));
                    doc.put("specialization", rs.getString("specialization"));
                    doc.put("contact", rs.getString("contact"));
                    doctors.add(doc);
                }
            } catch (Exception e) { e.printStackTrace(); }
            ctx.json(doctors);
        });

        // --- PATIENTS ---
        app.get("/api/patients", ctx -> {
            List<Map<String, Object>> patients = new ArrayList<>();
            try (Connection conn = DatabaseManager.getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM patients ORDER BY registration_date DESC")) {
                while (rs.next()) {
                    Map<String, Object> p = new HashMap<>();
                    p.put("id", rs.getInt("id"));
                    p.put("name", rs.getString("name"));
                    p.put("age", rs.getInt("age"));
                    p.put("gender", rs.getString("gender"));
                    p.put("contact", rs.getString("contact"));
                    p.put("registration_date", rs.getString("registration_date"));
                    patients.add(p);
                }
            } catch (Exception e) { e.printStackTrace(); }
            ctx.json(patients);
        });

        app.post("/api/patients", ctx -> {
            Map body = ctx.bodyAsClass(Map.class);
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(
                         "INSERT INTO patients (name, age, gender, contact, password) VALUES (?, ?, ?, ?, ?)")) {
                pstmt.setString(1, body.get("name").toString());
                pstmt.setInt(2, Integer.parseInt(body.get("age").toString()));
                pstmt.setString(3, body.get("gender").toString());
                pstmt.setString(4, body.get("contact").toString());
                pstmt.setString(5, body.get("password") != null ? body.get("password").toString() : "123");
                pstmt.executeUpdate();
                ctx.status(201).json(Map.of("message", "Patient registered successfully"));
            } catch (Exception e) {
                ctx.status(500).json(Map.of("error", e.getMessage()));
            }
        });

        // --- AUTH ---
        app.post("/api/auth/login", ctx -> {
            Map body = ctx.bodyAsClass(Map.class);
            String role = body.get("role").toString();
            try (Connection conn = DatabaseManager.getConnection()) {
                if (role.equals("patient")) {
                    String name = body.get("name").toString();
                    String contact = body.get("contact").toString();
                    try (PreparedStatement pstmt = conn.prepareStatement(
                            "SELECT * FROM patients WHERE name = ? AND contact = ?")) {
                        pstmt.setString(1, name);
                        pstmt.setString(2, contact);
                        try (ResultSet rs = pstmt.executeQuery()) {
                            if (rs.next()) {
                                Map<String, Object> user = new HashMap<>();
                                user.put("id", rs.getInt("id"));
                                user.put("name", rs.getString("name"));
                                user.put("role", "patient");
                                ctx.json(user);
                            } else {
                                ctx.status(401).json(Map.of("error", "Patient not found. Check your Full Name and Mobile Number."));
                            }
                        }
                    }
                } else if (role.equals("doctor")) {
                    String docId = body.get("id").toString();
                    String email = body.get("email").toString();
                    String password = body.get("password").toString();
                    try (PreparedStatement pstmt = conn.prepareStatement(
                            "SELECT * FROM doctors WHERE id = ? AND email = ? AND password = ?")) {
                        pstmt.setInt(1, Integer.parseInt(docId));
                        pstmt.setString(2, email);
                        pstmt.setString(3, password);
                        try (ResultSet rs = pstmt.executeQuery()) {
                            if (rs.next()) {
                                Map<String, Object> user = new HashMap<>();
                                user.put("id", rs.getInt("id"));
                                user.put("name", rs.getString("name"));
                                user.put("role", "doctor");
                                ctx.json(user);
                            } else {
                                ctx.status(401).json(Map.of("error", "Invalid Doctor ID, Email, or Password."));
                            }
                        }
                    }
                } else {
                    ctx.status(400).json(Map.of("error", "Invalid role specified"));
                }
            } catch (Exception e) {
                ctx.status(500).json(Map.of("error", "Login failed: " + e.getMessage()));
            }
        });

        // --- APPOINTMENTS ---
        app.get("/api/appointments", ctx -> {
            List<Map<String, Object>> appointments = new ArrayList<>();
            String query = "SELECT a.id, p.name as patient_name, d.name as doctor_name, " +
                           "a.appointment_date, a.status, a.problem " +
                           "FROM appointments a " +
                           "JOIN patients p ON a.patient_id = p.id " +
                           "JOIN doctors d ON a.doctor_id = d.id " +
                           "ORDER BY a.appointment_date DESC";
            try (Connection conn = DatabaseManager.getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(query)) {
                while (rs.next()) {
                    Map<String, Object> apt = new HashMap<>();
                    apt.put("id", rs.getInt("id"));
                    apt.put("patient_name", rs.getString("patient_name"));
                    apt.put("doctor_name", rs.getString("doctor_name"));
                    apt.put("appointment_date", rs.getString("appointment_date"));
                    apt.put("status", rs.getString("status"));
                    apt.put("problem", rs.getString("problem"));
                    appointments.add(apt);
                }
            } catch (Exception e) { e.printStackTrace(); }
            ctx.json(appointments);
        });

        app.post("/api/appointments", ctx -> {
            Map body = ctx.bodyAsClass(Map.class);
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(
                         "INSERT INTO appointments (patient_id, doctor_id, appointment_date, problem) VALUES (?, ?, ?, ?)")) {
                pstmt.setInt(1, Integer.parseInt(body.get("patient_id").toString()));
                pstmt.setInt(2, Integer.parseInt(body.get("doctor_id").toString()));
                pstmt.setString(3, body.get("appointment_date").toString());
                pstmt.setString(4, body.get("problem").toString());
                pstmt.executeUpdate();

                // Auto-generate Bill
                try (Statement bs = conn.createStatement();
                     ResultSet brs = bs.executeQuery("SELECT LAST_INSERT_ID()")) {
                    if (brs.next()) {
                        int aptId = brs.getInt(1);
                        double amount = 150.0 + (Math.round(Math.random() * 300.0));
                        try (PreparedStatement bp = conn.prepareStatement(
                                "INSERT INTO billing (patient_id, appointment_id, amount, status) VALUES (?, ?, ?, 'UNPAID')")) {
                            bp.setInt(1, Integer.parseInt(body.get("patient_id").toString()));
                            bp.setInt(2, aptId);
                            bp.setDouble(3, amount);
                            bp.executeUpdate();
                        }
                    }
                } catch (Exception ignored) {}

                ctx.status(201).json(Map.of("message", "Appointment scheduled successfully"));
            } catch (Exception e) {
                ctx.status(500).json(Map.of("error", e.getMessage()));
            }
        });

        app.put("/api/appointments/{id}/cancel", ctx -> {
            String id = ctx.pathParam("id");
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(
                         "UPDATE appointments SET status = 'CANCELLED' WHERE id = ?")) {
                pstmt.setInt(1, Integer.parseInt(id));
                pstmt.executeUpdate();
                ctx.json(Map.of("message", "Appointment cancelled"));
            } catch (Exception e) {
                ctx.status(500).json(Map.of("error", e.getMessage()));
            }
        });

        // --- BILLING ---
        app.get("/api/billing", ctx -> {
            List<Map<String, Object>> bills = new ArrayList<>();
            String query = "SELECT b.id, p.name as patient_name, d.name as doctor_name, " +
                           "a.appointment_date, b.amount, b.status " +
                           "FROM billing b " +
                           "JOIN patients p ON b.patient_id = p.id " +
                           "JOIN appointments a ON b.appointment_id = a.id " +
                           "JOIN doctors d ON a.doctor_id = d.id " +
                           "ORDER BY b.id DESC";
            try (Connection conn = DatabaseManager.getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(query)) {
                while (rs.next()) {
                    Map<String, Object> bill = new HashMap<>();
                    bill.put("id", rs.getInt("id"));
                    bill.put("patient_name", rs.getString("patient_name"));
                    bill.put("doctor_name", rs.getString("doctor_name"));
                    bill.put("appointment_date", rs.getString("appointment_date"));
                    bill.put("amount", rs.getDouble("amount"));
                    bill.put("status", rs.getString("status"));
                    bills.add(bill);
                }
            } catch (Exception ignored) {}
            ctx.json(bills);
        });

        app.put("/api/billing/{id}/pay", ctx -> {
            String id = ctx.pathParam("id");
            try (Connection conn = DatabaseManager.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(
                         "UPDATE billing SET status = 'PAID' WHERE id = ?")) {
                pstmt.setInt(1, Integer.parseInt(id));
                pstmt.executeUpdate();
                ctx.json(Map.of("message", "Bill paid successfully"));
            } catch (Exception e) {
                ctx.status(500).json(Map.of("error", e.getMessage()));
            }
        });
    }

    private static int getCount(String table) {
        try (Connection conn = DatabaseManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM " + table)) {
            if (rs.next()) return rs.getInt(1);
        } catch (Exception e) { e.printStackTrace(); }
        return 0;
    }

    private static void seedDoctors() {
        try (Connection conn = DatabaseManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM doctors")) {
            if (rs.next() && rs.getInt(1) == 0) {
                stmt.executeUpdate("INSERT INTO doctors (name, specialization, contact, email, password) VALUES " +
                        "('Dr. Smith', 'Cardiologist', '1234567890', 'smith@hospital.com', 'admin123')," +
                        "('Dr. Adams', 'Pediatrician', '0987654321', 'adams@hospital.com', 'admin123')," +
                        "('Dr. Johnson', 'Neurologist', '1122334455', 'johnson@hospital.com', 'admin123')");
            }
        } catch (Exception e) {
            System.err.println("[SEED] Could not seed doctors: " + e.getMessage());
        }
    }

    private static void seedMockData() {
        try (Connection conn = DatabaseManager.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM patients")) {
            if (rs.next() && rs.getInt(1) == 0) {
                stmt.executeUpdate("INSERT INTO patients (name, age, gender, contact, password) VALUES ('Alice Johnson', 28, 'Female', '+1234567890', '123')");
                stmt.executeUpdate("INSERT INTO appointments (patient_id, doctor_id, problem, appointment_date, status) VALUES (1, 1, 'Routine Checkup', '2026-04-01 10:00:00', 'SCHEDULED')");
                stmt.executeUpdate("INSERT INTO billing (patient_id, appointment_id, amount, status) VALUES (1, 1, 150.00, 'UNPAID')");
            }
        } catch (Exception ignored) {}
    }
}
