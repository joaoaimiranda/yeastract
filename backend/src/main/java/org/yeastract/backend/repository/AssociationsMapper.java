package org.yeastract.backend.repository;

import org.springframework.jdbc.core.RowMapper;
import org.yeastract.backend.entities.repository.AssociationsRow;

import java.sql.ResultSet;
import java.sql.SQLException;

public class AssociationsMapper implements RowMapper<AssociationsRow> {
    @Override
    public AssociationsRow mapRow(ResultSet rs, int rowNum) {
        try {
            AssociationsRow row = new AssociationsRow();
            row.setTfid(rs.getLong("tfid"));
            row.setTf(rs.getString("protein"));
            row.setOrfid(rs.getLong("targetid"));
            row.setOrf(rs.getString("orf"));
            row.setGene(rs.getString("gene").equals("Uncharacterized") ?
                    rs.getString("orf") : rs.getString("gene"));
            return row;
        } catch (SQLException e) {
            System.err.println("ERROR IN QUERY: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
