package org.yeastract.backend.repository;

import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ORFMapper implements RowMapper<Long> {
    @Override
    public Long mapRow(ResultSet rs, int rowNum) {
        try {
            return rs.getLong("orfid");
        } catch (SQLException e) {
            System.err.println("ERROR IN QUERY: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
