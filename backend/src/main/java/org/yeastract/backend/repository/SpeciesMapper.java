package org.yeastract.backend.repository;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class SpeciesMapper implements RowMapper<String> {
    @Override
    public String mapRow(ResultSet rs, int rowNum) {
        try {
            return rs.getString("species");
        } catch (SQLException e) {
            System.err.println("ERROR IN QUERY: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}