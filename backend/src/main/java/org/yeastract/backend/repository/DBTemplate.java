package org.yeastract.backend.repository;

import lombok.Getter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
@Component
public class DBTemplate {
    private final DataSource dataSource;
    @Getter
    private JdbcTemplate jdbcTemplateObject;

    public DBTemplate(DataSource dataSource) {
        this.dataSource = dataSource;
        this.jdbcTemplateObject = new JdbcTemplate(dataSource);
    }
}
